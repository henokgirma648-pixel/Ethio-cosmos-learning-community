import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left - Site name */}
          <div className="text-white font-bold text-lg">
            Ethio-cosmos-learning-community
          </div>

          {/* Center - Nav links */}
          <div className="flex items-center gap-6">
            <Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">
              Home
            </Link>
            <Link to="/learning" className="text-gray-400 hover:text-white text-sm transition-colors">
              Learning
            </Link>
            <Link to="/materials" className="text-gray-400 hover:text-white text-sm transition-colors">
              Materials
            </Link>
            <Link to="/about" className="text-gray-400 hover:text-white text-sm transition-colors">
              About
            </Link>
          </div>

          {/* Right - Copyright */}
          <div className="text-gray-500 text-sm">
            © 2024 Ethio-cosmos-learning-community
          </div>
        </div>
      </div>
    </footer>
  );
}
