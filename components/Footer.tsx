import React from 'react';

const TRADEMARK_IMAGE = "https://res.cloudinary.com/dsencimjn/image/upload/v1764631493/urnisamark_qq8lso.png";

const Footer: React.FC = () => {
  return (
    // Removed bg-black/30 and border-t to remove the visual "box"
    <footer className="mt-12 pb-8 relative overflow-visible">
      <div className="container mx-auto px-4 flex flex-col justify-center items-center gap-4">
        
        {/* Trademark Image placed above the text */}
        <img 
            src={TRADEMARK_IMAGE} 
            alt="Urnisa Trademark" 
            className="h-20 md:h-24 w-auto opacity-60 hover:opacity-100 transition-opacity select-none" 
        />

        <p className="text-gray-500 text-xs md:text-sm text-center select-none tracking-wide">
          &copy; {new Date().getFullYear()} urnisa_ All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;