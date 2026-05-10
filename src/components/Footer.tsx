export function Footer() {
  return (
    <footer className="mt-24 mx-3 md:mx-6 mb-3">
      <div className="card p-8 md:p-12">
        <div className="grid md:grid-cols-3 gap-8 text-sm">
          <div>
            <p className="font-bold text-xl tracking-tight">Digify</p>
            <p className="text-muted mt-2 max-w-sm">
              A small, modern marketplace for digital goods made by independent
              people. Built as a coursework project for E-commerce Technologies.
            </p>
          </div>
          <div>
            <p className="label">Browse</p>
            <ul className="space-y-1.5 text-muted">
              <li><a href="/products" className="link">All products</a></li>
              <li><a href="/categories" className="link">Categories</a></li>
              <li><a href="/products?type=EBOOK" className="link">E-books</a></li>
              <li><a href="/products?type=SOFTWARE" className="link">Software</a></li>
            </ul>
          </div>
          <div>
            <p className="label">Account</p>
            <ul className="space-y-1.5 text-muted">
              <li><a href="/login" className="link">Sign in</a></li>
              <li><a href="/register" className="link">Create an account</a></li>
              <li><a href="/seller" className="link">Become a seller</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-black/[0.06] mt-8 pt-5 flex justify-between text-xs text-muted">
          <span>© 2025 Digify</span>
          <span className="font-mono">Made with care</span>
        </div>
      </div>
    </footer>
  );
}
