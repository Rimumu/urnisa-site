import React from 'react';

const TRADEMARK_IMAGE = "https://res.cloudinary.com/dsencimjn/image/upload/v1764631493/urnisamark_qq8lso.png";

const Footer: React.FC = () => {
  return (
    <footer className="bg-black/30 mt-12 border-t border-white/10 relative overflow-visible">
      {/* 
        Using a flex container with visible overflow allows the image to be taller 
        than the footer itself without stretching the footer's height.
      */}
      <div className="container mx-auto py-4 px-4 flex flex-row justify-center items-center gap-4 relative">
        <p className="text-gray-400 text-sm text-center z-10 select-none">
          &copy; {new Date().getFullYear()} urnisa_ All Rights Reserved.
        </p>
        
        {/* 
            Trademark Stamp 
            Large size (h-24) but positioned to overflow slightly if needed 
            so footer stays slim.
        */}
        <div className="relative h-0 w-0 flex items-center">
             <img 
                src={TRADEMARK_IMAGE} 
                alt="Urnisa Trademark" 
                className="h-20 md:h-24 w-auto max-w-none opacity-60 hover:opacity-100 transition-opacity select-none absolute left-2 -translate-y-1/2" 
            />
        </div>
      </div>
    </footer>
  );
};

export default Footer;