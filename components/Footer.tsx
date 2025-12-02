
import React from 'react';

const TRADEMARK_IMAGE = "https://res.cloudinary.com/dsencimjn/image/upload/v1764631493/urnisamark_qq8lso.png";

const Footer: React.FC = () => {
  return (
    <footer className="bg-black/30 mt-12 border-t border-white/10">
      <div className="container mx-auto py-6 px-4 flex flex-row justify-center items-center gap-4">
        <p className="text-gray-400 text-sm text-center z-10 select-none">
          &copy; {new Date().getFullYear()} urnisa_ All Rights Reserved.
        </p>
        
        <img 
           src={TRADEMARK_IMAGE} 
           alt="Urnisa Trademark" 
           className="h-10 w-auto opacity-60 hover:opacity-100 transition-opacity select-none" 
       />
      </div>
    </footer>
  );
};

export default Footer;
