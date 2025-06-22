export default function MessageBox({ message, type }) {
  if (!message) return <div className="message-box-wrapper" />;
  return (
    <div className="message-box-wrapper">
      <div className={`message-box ${type}`}>{message}</div>
    </div>
  );
}