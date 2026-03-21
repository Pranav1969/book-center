// components/BookCard.tsx
import React from 'react';
import Link from 'next/link';

interface BookProps {
  id: number;
  title: string;
  author: string;
  price: number;
  category: string;
  image_url?: string;
  back_image_url?: string;
}

export default function BookCard({ id, title, author, price, category, image_url, back_image_url }: BookProps) {
  return (
    <Link href={`/book/${id}`} className="group block">
      <div className="flex flex-col h-full p-4 border border-stone-200 bg-white hover:shadow-2xl hover:border-teal-200 transition-all duration-500 rounded-sm">
        
        {/* Animated Cover Container */}
        <div className="relative aspect-[3/4] mb-4 bg-stone-100 border border-stone-50 overflow-hidden shadow-md">
          
          {/* FRONT COVER: Slides away after 1 second hover */}
          <div className="absolute inset-0 z-20 transform transition-transform duration-700 ease-in-out delay-1000 group-hover:-translate-x-full">
            {image_url ? (
              <img 
                src={image_url} 
                alt={title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-stone-200 text-stone-400 text-[10px] uppercase tracking-widest">
                No Front Cover
              </div>
            )}
          </div>

          {/* BACK COVER: Revealed underneath */}
          <div className="absolute inset-0 z-10 bg-stone-800">
            {back_image_url ? (
              <img 
                src={back_image_url} 
                alt={`${title} back`} 
                className="w-full h-full object-cover opacity-90"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-stone-400">
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Synopsis</p>
                <div className="h-px w-8 bg-stone-600 mb-2" />
                <p className="text-[9px] italic">Hover to reveal the back cover details.</p>
              </div>
            )}
          </div>
        </div>

        {/* Book Info */}
        <div className="flex flex-col flex-grow">
          <h3 className="font-serif text-lg font-bold text-stone-900 leading-tight group-hover:text-teal-800 transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-stone-600 italic font-serif mt-1">{author}</p>
          
          <div className="mt-auto pt-4 flex justify-between items-center border-t border-stone-50">
            <span className="text-sm font-bold text-stone-900">${Number(price).toFixed(2)}</span>
            <span className="text-[10px] uppercase tracking-widest font-black text-teal-700 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
              View &rarr;
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}