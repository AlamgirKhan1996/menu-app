export default function StickyOrderButton({ client, cart }) {
  const sendOrder = () => {
    const message = `Hello, I want to order:\n\n` +
      cart.map(i => `• ${i.name} x1 - ${i.price} SAR`).join("\n") +
      `\n\nTotal: ${cart.reduce((a,b)=>a+b.price,0)} SAR`;

    window.open(`https://wa.me/${client.phone}?text=${encodeURIComponent(message)}`);
  };

  return (
    <div style={{
      position: "fixed",
      bottom: 20,
      left: 20,
      right: 20,
      background: client.accentColor,
      color: "#fff",
      padding: "14px",
      borderRadius: "999px",
      textAlign: "center",
      fontWeight: 600,
      zIndex: 999,
      cursor: "pointer"
    }}
    onClick={sendOrder}
    >
      🛒 Send Order on WhatsApp
    </div>
  );
}