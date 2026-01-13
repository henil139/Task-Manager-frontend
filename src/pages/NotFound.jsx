export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <div style={{ textAlign: 'center' }}>
        <h1>404</h1>
        <p>Page not found</p>
        <a href="/">Go Home</a>
      </div>
    </div>
  );
}
