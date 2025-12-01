import React from 'react';

const TRADEMARK_IMAGE = "https://res.cloudinary.com/dsencimjn/image/upload/v1764631493/urnisamark_qq8lso.png";

const Footer: React.FC = () => {
  return (
    <footer className="bg-black/30 mt-12 border-t border-white/10 relative overflow-hidden">
      <div className="container mx-auto py-8 px-4 flex justify-center items-center relative">
        <p className="text-gray-400 text-sm text-center z-10">
          &copy; {new Date().getFullYear()} urnisa. All Rights Reserved.
        </p>
        
        {/* 
            Trademark Stamp 
            Positioned absolutely so it doesn't expand the footer height.
            Aligned to the right side.
        */}
        <img 
          src={TRADEMARK_IMAGE} 
          alt="Urnisa Trademark" 
          className="absolute right-4 md:right-10 top-1/2 transform -translate-y-1/2 h-16 md:h-24 w-auto opacity-50 hover:opacity-100 transition-opacity select-none" 
        />
      </div>
    </footer>
  );
};

export default Footer;