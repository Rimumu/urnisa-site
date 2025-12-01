
import React from 'react';

const TRADEMARK_IMAGE = "https://res.cloudinary.com/dsencimjn/image/upload/v1764629964/urnisamark_qq8lso.png";

const Footer: React.FC = () => {
  return (
    <footer className="bg-black/30 mt-12 border-t border-white/10">
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-center items-center gap-3">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} urnisa. All Rights Reserved.
          </p>
          <img 
            src={TRADEMARK_IMAGE} 
            alt="Urnisa Trademark" 
            className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity select-none" 
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
