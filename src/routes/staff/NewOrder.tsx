import { useRef, useState, type CSSProperties } from "react";
import { createOrder } from "../../api/orders";
import Button from "../../components/common/Button";
import SafeView from "../../components/common/SafeView";
import { COLORS, DARK_THEME, FONT_SIZES, LIGHT_THEME, RADIUS, SPACING } from "../../constants/theme";
import { useTheme } from "../../context/ThemeContext";

const MENU_PAGES = [
  [
    { name: "Pizza", tiers: [80, 100, 120] },
    { name: "Fried Rice", tiers: [50, 60] },
    { name: "Jollof Rice", tiers: [50, 60] },
    { name: "Banku & Tilapia", tiers: [55, 75] },
    { name: "Spaghetti", tiers: [40, 60] },
    { name: "Shawarma", tiers: [40, 55] },
  ],
  [
    { name: "Burger", tiers: [50, 65] },
    { name: "Assorted Jollof", tiers: [45, 65] },
    { name: "Assorted Fried", tiers: [45, 65] },
    { name: "French Fries", tiers: [20, 35] },
    { name: "Cake", tiers: [30, 45] },
    { name: "Loaded Fries", tiers: [35] },
    { name: "Sobolo / Drink", tiers: [15, 20] },
  ],
];

interface MenuItem { name: string; tiers: number[] }
interface CartItem { name: string; tiers: number[]; price: string; useCustom: boolean; customPrice: string; quantity: number }
interface CustomItem { name: string; price: string; quantity: number }

function freshCartItem(menuItem: MenuItem): CartItem {
  const firstTier = menuItem.tiers?.[0] ?? null;
  return { name: menuItem.name, tiers: menuItem.tiers, price: firstTier !== null ? String(firstTier) : "", useCustom: false, customPrice: "", quantity: 1 };
}

function effectivePrice(item: CartItem) {
  if (item.useCustom) return parseFloat(item.customPrice) || 0;
  return parseFloat(item.price) || 0;
}

export default function NewOrder() {
  const { isDark } = useTheme();
  const theme = isDark ? DARK_THEME : LIGHT_THEME;

  const carouselRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(0);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [customerName, setCustomerName] = useState("");

  const [focused, setFocused] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const phoneRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);

  const handleCarouselScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const page = Math.round(el.scrollLeft / el.clientWidth);
    setActivePage(page);
  };

  const handleChipTap = (menuItem: MenuItem) => {
    const exists = cartItems.findIndex((i) => i.name === menuItem.name);
    if (exists !== -1) {
      setCartItems((prev) => prev.filter((_, i) => i !== exists));
    } else {
      setCartItems((prev) => [...prev, freshCartItem(menuItem)]);
    }
  };

  const setCartTier = (index: number, price: string) =>
    setCartItems((prev) => prev.map((item, i) => (i === index ? { ...item, price, useCustom: false, customPrice: "" } : item)));

  const toggleCartCustom = (index: number) =>
    setCartItems((prev) => prev.map((item, i) => (i === index ? { ...item, useCustom: !item.useCustom } : item)));

  const setCartCustomPrice = (index: number, customPrice: string) =>
    setCartItems((prev) => prev.map((item, i) => (i === index ? { ...item, customPrice } : item)));

  const setCartQty = (index: number, newQty: number) => {
    if (newQty < 1) {
      setCartItems((prev) => prev.filter((_, i) => i !== index));
    } else {
      setCartItems((prev) => prev.map((item, i) => (i === index ? { ...item, quantity: newQty } : item)));
    }
  };

  const removeCartItem = (index: number) => setCartItems((prev) => prev.filter((_, i) => i !== index));

  const addCustomItem = () => setCustomItems((prev) => [...prev, { name: "", price: "", quantity: 1 }]);

  const updateCustomItem = (index: number, field: keyof CustomItem, value: string | number) =>
    setCustomItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));

  const removeCustomItem = (index: number) => setCustomItems((prev) => prev.filter((_, i) => i !== index));

  const validCartItems = cartItems.filter((i) => effectivePrice(i) > 0);
  const validCustomItems = customItems.filter((i) => i.name.trim() && parseFloat(i.price) > 0);
  const allItems = [...validCartItems, ...validCustomItems];
  const hasItems = allItems.length > 0;
  const total = [
    ...cartItems.map((i) => i.quantity * effectivePrice(i)),
    ...customItems.map((i) => i.quantity * (parseFloat(i.price) || 0)),
  ].reduce((a, b) => a + b, 0);

  const validate = () => {
    if (!hasItems) return "Add at least one item to the order.";
    for (const item of cartItems) {
      if (effectivePrice(item) <= 0) return `Set a price for "${item.name}".`;
    }
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { window.alert(err); return; }

    setLoading(true);
    const payload = {
      customerName: customerName.trim() || phoneNumber.trim() || "Manual Order",
      phoneNumber: phoneNumber.trim(),
      deliveryAddress: deliveryAddress.trim() || "Pickup / Call Customer",
      channelSource: "Manual",
      statusState: "Pending",
      totalAmount: parseFloat(total.toFixed(2)),
      items: allItems.map((item: any) => ({
        foodItemName: item.name.trim(),
        quantity: parseInt(String(item.quantity), 10),
        price: parseFloat(item.useCustom ? item.customPrice : item.price),
      })),
    };

    try {
      await createOrder(payload);
      window.alert(`✅ Order Created — Order for ${phoneNumber || "customer"} placed successfully.`);
      resetForm();
    } catch (e: any) {
      window.alert(e.message || "Could not create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCartItems([]);
    setCustomItems([]);
    setCustomerName("");
    setPhoneNumber("");
    setDeliveryAddress("");
  };

  return (
    <SafeView variant={isDark ? "dark" : "light"} edges={["top", "left", "right"]}>
      <div style={{ flex: 1, overflowY: "auto", paddingLeft: SPACING["2xl"], paddingRight: SPACING["2xl"] }}>
        <h1 style={{ fontSize: FONT_SIZES.xl, fontWeight: 800, paddingTop: SPACING.xl, marginBottom: SPACING.xs, color: theme.text }}>New Order</h1>
        <p style={{ fontSize: FONT_SIZES.sm, marginBottom: SPACING.lg, color: theme.textMuted }}>Tap to add · swipe for more items</p>

        {/* Carousel */}
        <div style={{ borderRadius: RADIUS["2xl"], border: `1px solid ${theme.borderStrong}`, boxShadow: theme.shadowSm, overflow: "hidden", marginBottom: SPACING.sm, backgroundColor: theme.card }}>
          <div
            ref={carouselRef}
            onScroll={handleCarouselScroll}
            style={{
              display: "flex", overflowX: "auto", scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch", scrollbarWidth: "none",
            }}
          >
            {MENU_PAGES.map((page, pageIndex) => (
              <div key={pageIndex} style={{ minWidth: "100%", scrollSnapAlign: "start", padding: `${SPACING.lg}px ${SPACING.lg}px 0` }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: SPACING.sm }}>
                  {page.map((menuItem) => {
                    const isSelected = cartItems.some((i) => i.name === menuItem.name);
                    return (
                      <button
                        key={menuItem.name}
                        onClick={() => handleChipTap(menuItem)}
                        style={{
                          width: "48%", padding: `${SPACING.sm}px ${SPACING.md}px`, borderRadius: RADIUS.xl,
                          border: `1.5px solid ${isSelected ? COLORS.red : theme.borderStrong}`,
                          backgroundColor: isSelected ? COLORS.red : theme.inputBg,
                          boxShadow: isSelected ? theme.shadowSm : "none",
                          textAlign: "center", cursor: "pointer",
                        }}
                      >
                        <div style={{ fontSize: FONT_SIZES.sm, fontWeight: 700, color: isSelected ? COLORS.white : theme.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {menuItem.name}
                        </div>
                        <div style={{ fontSize: FONT_SIZES.xs, marginTop: 2, color: isSelected ? "rgba(255,255,255,0.75)" : theme.textMuted }}>
                          {menuItem.tiers ? `GHS ${menuItem.tiers[0]}+` : "Custom"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${SPACING.sm}px ${SPACING.lg}px` }}>
            <span style={{ fontSize: FONT_SIZES.xs, fontWeight: 600, color: theme.textFaint }}>
              {activePage === 0 ? "⭐ Popular" : "More items"}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {MENU_PAGES.map((_, i) => (
                <div key={i} style={{ height: 6, borderRadius: RADIUS.full, width: i === activePage ? 16 : 6, backgroundColor: i === activePage ? COLORS.red : theme.borderStrong, transition: "width 0.2s ease" }} />
              ))}
            </div>
          </div>
        </div>

        {/* Order items */}
        {(cartItems.length > 0 || customItems.length > 0) && (
          <>
            <div style={sectionHeaderStyle(theme)}>Order Items ({cartItems.length + customItems.length})</div>
            <div style={sectionStyle(theme)}>
              {cartItems.map((item, index) => (
                <CartItemRow
                  key={`cart-${item.name}`}
                  item={item}
                  index={index}
                  onSetTier={setCartTier}
                  onToggleCustom={toggleCartCustom}
                  onCustomPrice={setCartCustomPrice}
                  onQtyChange={setCartQty}
                  onRemove={removeCartItem}
                  focused={focused}
                  onFocus={setFocused}
                  onBlur={() => setFocused(null)}
                  theme={theme}
                />
              ))}

              {customItems.map((item, index) => (
                <CustomItemRow
                  key={`custom-${index}`}
                  item={item}
                  index={index}
                  onUpdate={updateCustomItem}
                  onRemove={removeCustomItem}
                  focused={focused}
                  onFocus={setFocused}
                  onBlur={() => setFocused(null)}
                  theme={theme}
                />
              ))}

              <button onClick={addCustomItem} style={addCustomBtnStyle(theme)}>
                <span style={{ fontSize: FONT_SIZES.sm, fontWeight: 700, color: COLORS.red }}>＋ Add item not on menu</span>
              </button>
            </div>
          </>
        )}

        {cartItems.length === 0 && customItems.length === 0 && (
          <button onClick={addCustomItem} style={{ ...addCustomBtnStyle(theme), marginTop: SPACING.sm, backgroundColor: theme.card, width: "100%" }}>
            <span style={{ fontSize: FONT_SIZES.sm, fontWeight: 700, color: COLORS.red }}>＋ Add item not on menu</span>
          </button>
        )}

        {hasItems && (
          <div style={{ borderRadius: RADIUS["2xl"], border: `1px solid ${theme.borderStrong}`, boxShadow: theme.shadowSm, padding: SPACING["2xl"], display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: SPACING.sm, backgroundColor: theme.card }}>
            <span style={{ fontSize: FONT_SIZES.base, fontWeight: 600, color: theme.textMuted }}>Grand Total</span>
            <span style={{ fontSize: FONT_SIZES["2xl"], fontWeight: 900, color: COLORS.red }}>GHS {total.toFixed(2)}</span>
          </div>
        )}

        {/* Customer */}
        <div style={sectionHeaderStyle(theme)}>Customer</div>
        <div style={sectionStyle(theme)}>
          <label style={fieldLabelStyle(theme)}>
            Customer Name <span style={{ color: theme.textFaint, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
          </label>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="e.g. Ama or Table 3"
            style={{ ...inputStyle(theme, focused === "name"), marginBottom: SPACING.lg }}
            onFocus={() => setFocused("name")}
            onBlur={() => setFocused(null)}
            onKeyDown={(e) => e.key === "Enter" && phoneRef.current?.focus()}
          />

          <label style={fieldLabelStyle(theme)}>
            Phone Number <span style={{ color: theme.textFaint, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
          </label>
          <input
            ref={phoneRef}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="023#######"
            type="tel"
            style={{ ...inputStyle(theme, focused === "phone"), marginBottom: SPACING.lg }}
            onFocus={() => setFocused("phone")}
            onBlur={() => setFocused(null)}
            onKeyDown={(e) => e.key === "Enter" && addressRef.current?.focus()}
          />

          <label style={fieldLabelStyle(theme)}>
            Delivery Location <span style={{ color: theme.textFaint, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
          </label>
          <input
            ref={addressRef}
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="e.g. Shai Hills, Community 3"
            style={inputStyle(theme, focused === "address")}
            onFocus={() => setFocused("address")}
            onBlur={() => setFocused(null)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />

          <p style={{ fontSize: FONT_SIZES.xs, marginTop: SPACING.sm, lineHeight: "17px", color: theme.textFaint }}>
            All fields optional for walk-ins. Add a number or location for delivery orders.
          </p>
        </div>

        <Button label="Create Order" onClick={handleSubmit} loading={loading} disabled={loading || !hasItems} size="lg" style={{ marginTop: SPACING.lg }} />

        <button onClick={resetForm} style={{ display: "block", width: "100%", textAlign: "center", padding: `${SPACING.lg}px 0`, background: "none", border: "none", cursor: "pointer" }}>
          <span style={{ fontSize: FONT_SIZES.sm, color: theme.textFaint }}>Clear form</span>
        </button>

        <div style={{ height: SPACING["4xl"] }} />
      </div>
    </SafeView>
  );
}

function CartItemRow({
  item, index, onSetTier, onToggleCustom, onCustomPrice, onQtyChange, onRemove, focused, onFocus, onBlur, theme,
}: {
  item: CartItem; index: number; onSetTier: (i: number, v: string) => void; onToggleCustom: (i: number) => void;
  onCustomPrice: (i: number, v: string) => void; onQtyChange: (i: number, q: number) => void; onRemove: (i: number) => void;
  focused: string | null; onFocus: (k: string) => void; onBlur: () => void; theme: typeof DARK_THEME;
}) {
  const tiers = item.tiers ?? [];
  const isFocused = focused === `cp-${index}`;

  return (
    <div style={{ paddingTop: SPACING.md, paddingBottom: SPACING.md, borderBottom: `1px solid ${theme.border}`, marginBottom: SPACING.xs }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.sm }}>
        <span style={{ fontSize: FONT_SIZES.base, fontWeight: 700, color: theme.text }}>{item.name}</span>
        <button onClick={() => onRemove(index)} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <span style={{ color: COLORS.red, fontSize: FONT_SIZES.xs, fontWeight: 700 }}>✕</span>
        </button>
      </div>

      <div style={{ marginTop: SPACING.xs }}>
        <div style={{ fontSize: FONT_SIZES.xs, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: SPACING.xs, color: theme.textFaint }}>Price</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: SPACING.xs }}>
          {tiers.map((t) => {
            const active = !item.useCustom && String(t) === item.price;
            return (
              <button
                key={t}
                onClick={() => onSetTier(index, String(t))}
                style={{
                  padding: `${SPACING.xs}px ${SPACING.md}px`, borderRadius: RADIUS.full, minWidth: 52, textAlign: "center",
                  border: `1.5px solid ${active ? COLORS.red : theme.borderStrong}`,
                  backgroundColor: active ? COLORS.red : theme.inputBg, cursor: "pointer",
                }}
              >
                <span style={{ fontSize: FONT_SIZES.sm, fontWeight: 700, color: active ? COLORS.white : theme.text }}>{t}</span>
              </button>
            );
          })}
          <button
            onClick={() => onToggleCustom(index)}
            style={{
              padding: `${SPACING.xs}px ${SPACING.md}px`, borderRadius: RADIUS.full, minWidth: 52, textAlign: "center",
              border: `1.5px solid ${item.useCustom ? COLORS.red : theme.borderStrong}`,
              backgroundColor: item.useCustom ? COLORS.redDark : theme.inputBg, cursor: "pointer",
            }}
          >
            <span style={{ fontSize: FONT_SIZES.sm, fontWeight: 700, color: item.useCustom ? COLORS.white : theme.textMuted }}>Custom</span>
          </button>
        </div>

        {item.useCustom && (
          <input
            value={item.customPrice}
            onChange={(e) => onCustomPrice(index, e.target.value)}
            placeholder="Enter price (GHS)"
            type="number"
            inputMode="decimal"
            style={{
              width: "100%", borderRadius: RADIUS.lg, border: `1.5px solid ${isFocused ? COLORS.red : theme.borderStrong}`,
              padding: `${SPACING.sm}px ${SPACING.lg}px`, fontSize: FONT_SIZES.base, marginTop: SPACING.sm,
              backgroundColor: theme.inputBg, color: theme.text, boxSizing: "border-box",
            }}
            onFocus={() => onFocus(`cp-${index}`)}
            onBlur={onBlur}
          />
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", marginTop: SPACING.sm, flexWrap: "wrap", gap: SPACING.sm }}>
        <div style={{ display: "flex", alignItems: "center", gap: SPACING.xs }}>
          <button onClick={() => onQtyChange(index, item.quantity - 1)} style={stepBtnStyle(theme.borderStrong)}>
            <span style={{ ...stepTxtStyle, color: theme.text }}>−</span>
          </button>
          <span style={{ fontSize: FONT_SIZES.base, fontWeight: 800, minWidth: 28, textAlign: "center", color: theme.text }}>{item.quantity}</span>
          <button onClick={() => onQtyChange(index, item.quantity + 1)} style={stepBtnStyle(COLORS.red)}>
            <span style={{ ...stepTxtStyle, color: COLORS.white }}>+</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomItemRow({
  item, index, onUpdate, onRemove, focused, onFocus, onBlur, theme,
}: {
  item: CustomItem; index: number; onUpdate: (i: number, field: keyof CustomItem, value: string | number) => void;
  onRemove: (i: number) => void; focused: string | null; onFocus: (k: string) => void; onBlur: () => void; theme: typeof DARK_THEME;
}) {
  const unitPrice = parseFloat(item.price) || 0;
  const subtotal = (item.quantity * unitPrice).toFixed(2);

  return (
    <div style={{ paddingTop: SPACING.md, paddingBottom: SPACING.md, borderBottom: `1px solid ${theme.border}`, marginBottom: SPACING.xs }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.sm }}>
        <span style={{ fontSize: FONT_SIZES.xs, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: theme.textFaint }}>Custom Item</span>
        <button onClick={() => onRemove(index)} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <span style={{ color: COLORS.red, fontSize: FONT_SIZES.xs, fontWeight: 700 }}>✕ Remove</span>
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: SPACING.sm }}>
        <input
          value={item.name}
          onChange={(e) => onUpdate(index, "name", e.target.value)}
          placeholder="Item name"
          style={{ flex: 2, borderRadius: RADIUS.lg, border: `1.5px solid ${focused === `cn-${index}` ? COLORS.red : theme.borderStrong}`, padding: `${SPACING.sm}px ${SPACING.md}px`, fontSize: FONT_SIZES.base, backgroundColor: theme.inputBg, color: theme.text, boxSizing: "border-box" }}
          onFocus={() => onFocus(`cn-${index}`)}
          onBlur={onBlur}
        />
        <input
          value={item.price}
          onChange={(e) => onUpdate(index, "price", e.target.value)}
          placeholder="GHS"
          type="number"
          inputMode="decimal"
          style={{ flex: 1, borderRadius: RADIUS.lg, border: `1.5px solid ${focused === `cp2-${index}` ? COLORS.red : theme.borderStrong}`, padding: `${SPACING.sm}px ${SPACING.md}px`, fontSize: FONT_SIZES.base, backgroundColor: theme.inputBg, color: theme.text, boxSizing: "border-box" }}
          onFocus={() => onFocus(`cp2-${index}`)}
          onBlur={onBlur}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: SPACING.xs, marginTop: SPACING.sm }}>
        <button onClick={() => onUpdate(index, "quantity", Math.max(1, item.quantity - 1))} style={stepBtnStyle(theme.borderStrong)}>
          <span style={{ ...stepTxtStyle, color: theme.text }}>−</span>
        </button>
        <span style={{ fontSize: FONT_SIZES.base, fontWeight: 800, minWidth: 28, textAlign: "center", color: theme.text }}>{item.quantity}</span>
        <button onClick={() => onUpdate(index, "quantity", item.quantity + 1)} style={stepBtnStyle(COLORS.red)}>
          <span style={{ ...stepTxtStyle, color: COLORS.white }}>+</span>
        </button>
        {unitPrice > 0 && (
          <span style={{ fontSize: FONT_SIZES.xs, fontWeight: 600, marginLeft: SPACING.md, color: theme.textMuted }}>= GHS {subtotal}</span>
        )}
      </div>
    </div>
  );
}

function sectionHeaderStyle(theme: typeof DARK_THEME): CSSProperties {
  return { fontSize: FONT_SIZES.xs, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: SPACING.sm, marginTop: SPACING.lg, color: theme.textFaint };
}

function sectionStyle(theme: typeof DARK_THEME): CSSProperties {
  return { borderRadius: RADIUS["2xl"], border: `1px solid ${theme.borderStrong}`, boxShadow: theme.shadowSm, padding: SPACING["2xl"], marginBottom: SPACING.sm, backgroundColor: theme.card };
}

function fieldLabelStyle(theme: typeof DARK_THEME): CSSProperties {
  return { display: "block", fontSize: FONT_SIZES.xs, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: SPACING.xs, color: theme.textMuted };
}

function inputStyle(theme: typeof DARK_THEME, isFocused: boolean): CSSProperties {
  return { width: "100%", borderRadius: RADIUS.lg, border: `1.5px solid ${isFocused ? COLORS.red : theme.borderStrong}`, padding: `${SPACING.md}px ${SPACING.lg}px`, fontSize: FONT_SIZES.base, minHeight: 48, backgroundColor: theme.inputBg, color: theme.text, boxSizing: "border-box" };
}

function addCustomBtnStyle(theme: typeof DARK_THEME): CSSProperties {
  return { border: `1.5px dashed ${theme.borderStrong}`, borderRadius: RADIUS.lg, padding: `${SPACING.md}px 0`, textAlign: "center", marginTop: SPACING.md, background: "none", cursor: "pointer", width: "100%" };
}

function stepBtnStyle(bg: string): CSSProperties {
  return { width: 32, height: 32, borderRadius: RADIUS.full, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: bg, border: "none", cursor: "pointer" };
}

const stepTxtStyle: CSSProperties = { fontSize: FONT_SIZES.md, fontWeight: 800, lineHeight: "22px" };