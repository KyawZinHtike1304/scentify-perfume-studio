import React, { useState } from 'react';
import { CheckCircle2, MessageSquare, ArrowRight, ShieldCheck, Sparkles, Edit3 } from 'lucide-react';
import { Composition, ViewMode, CartItem } from '../types';

interface ReviewFragranceViewProps {
  composition: Composition;
  onConfirmAndShip: (customItem: CartItem) => void;
  onRequestChange: () => void;
  onNavigate: (view: ViewMode) => void;
}

export const ReviewFragranceView: React.FC<ReviewFragranceViewProps> = ({
  composition,
  onConfirmAndShip,
  onRequestChange,
  onNavigate,
}) => {
  const [selectedSize, setSelectedSize] = useState<'50ml' | '100ml'>('50ml');
  const price = selectedSize === '50ml' ? 1680 : 2580;

  const handleConfirm = () => {
    const customItem: CartItem = {
      id: `custom-${Date.now()}`,
      title: 'Custom Fragrance',
      subtitle: `${composition.topNote} · ${composition.heartNote} · ${composition.baseNote} · ${selectedSize}`,
      description: 'Handcrafted personal eau de parfum formulation',
      price: price,
      quantity: 1,
      image: '/assets/botanicals/custom_bottle.png',
      details: {
        notes: [composition.topNote, composition.heartNote, composition.baseNote],
        size: selectedSize,
      },
    };
    onConfirmAndShip(customItem);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 mb-8 border-b border-[#DAD1C5]/40 gap-4">
          <div>
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#C9A25C] font-semibold block mb-2">
              Your Perfume is Ready
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#28192A]">
              Review Your Custom Fragrance
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6166] font-light mt-2 max-w-xl">
              Our perfumer has prepared your final blend. Please review the details below and confirm before we ship.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center px-3.5 py-1.5 bg-[#FBF7F0] border border-[#DAD1C5] text-xs text-[#28192A]">
            <span className="w-2 h-2 rounded-full bg-[#C9A25C] animate-pulse"></span>
            <span className="font-medium tracking-wide">Awaiting your confirmation</span>
          </div>
        </div>

        {/* 2-Column Desktop Grid matching Page 7 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Fragrance Blueprint & Bottle Card */}
          <div className="lg:col-span-7 bg-[#FFFDF8] border border-[#DAD1C5] p-6 sm:p-10">
            <div className="flex items-center justify-between border-b border-[#DAD1C5]/30 pb-4 mb-6">
              <div>
                <span className="text-[10px] tracking-widest text-[#6B6166] uppercase">ORDER #LUM-8941</span>
                <h2 className="font-serif text-2xl text-[#28192A] mt-0.5">Your Custom Fragrance</h2>
                <span className="text-xs text-[#6B6166] font-light">Prepared by the Scentify Perfume Studio</span>
              </div>
              <button
                onClick={() => onNavigate('scentify')}
                className="text-xs text-[#C9A25C] hover:text-[#28192A] flex items-center gap-1"
                title="Edit Formula"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            {/* Bottle Mockup and Notes breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center py-4">
              
              {/* Bottle graphic with 'L' Monogram */}
              <div className="sm:col-span-5 bg-[#FBF7F0] border border-[#DAD1C5]/60 p-6 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-36 border border-[#28192A]/30 relative flex items-center justify-center bg-[#FFFDF8] shadow-xs">
                  <span className="font-serif text-5xl font-light text-[#C9A25C] select-none">
                    L
                  </span>
                  <div className="absolute top-0 inset-x-0 h-4 border-b border-[#28192A]/20 bg-[#FBF7F0]"></div>
                </div>
                <span className="text-[10px] tracking-[0.25em] text-[#28192A] font-medium uppercase mt-4">
                  {selectedSize.toUpperCase()} · EAU DE PARFUM
                </span>
                <span className="text-[9px] tracking-widest text-[#6B6166] mt-0.5">
                  Natural Artisanal Extraction
                </span>
              </div>

              {/* Notes Grid */}
              <div className="sm:col-span-7 space-y-4">
                <div>
                  <h3 className="font-serif text-xl text-[#28192A]">Custom Blend</h3>
                  <p className="text-xs text-[#6B6166] font-light mt-1 leading-relaxed">
                    A warm, luminous fragrance balanced between fresh citrus, soft florals, and deep woods.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#DAD1C5]/30">
                  <div>
                    <span className="text-[9px] tracking-[0.2em] uppercase text-[#6B6166] font-medium block">
                      TOP NOTE
                    </span>
                    <span className="font-serif text-base text-[#28192A]">
                      {composition.topNote || 'Bergamot'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] tracking-[0.2em] uppercase text-[#6B6166] font-medium block">
                      BASE NOTE
                    </span>
                    <span className="font-serif text-base text-[#28192A]">
                      {composition.baseNote || 'Oud'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] tracking-[0.2em] uppercase text-[#6B6166] font-medium block">
                      HEART NOTE
                    </span>
                    <span className="font-serif text-base text-[#28192A]">
                      {composition.heartNote || 'Jasmine'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] tracking-[0.2em] uppercase text-[#6B6166] font-medium block">
                      BOTTLE
                    </span>
                    <span className="font-serif text-base text-[#28192A]">
                      Classic · {selectedSize}
                    </span>
                  </div>
                </div>

                {/* Size toggle */}
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xs text-[#6B6166]">Size:</span>
                  <button
                    onClick={() => setSelectedSize('50ml')}
                    className={`px-3 py-1 text-xs border ${
                      selectedSize === '50ml'
                        ? 'border-[#28192A] bg-[#28192A] text-[#FFFDF8]'
                        : 'border-[#DAD1C5] text-[#28192A]'
                    }`}
                  >
                    50 ml (฿1,680)
                  </button>
                  <button
                    onClick={() => setSelectedSize('100ml')}
                    className={`px-3 py-1 text-xs border ${
                      selectedSize === '100ml'
                        ? 'border-[#28192A] bg-[#28192A] text-[#FFFDF8]'
                        : 'border-[#DAD1C5] text-[#28192A]'
                    }`}
                  >
                    100 ml (฿2,580)
                  </button>
                </div>
              </div>

            </div>

            {/* Shipping note footer */}
            <div className="mt-8 pt-5 border-t border-[#DAD1C5]/40 flex flex-col sm:flex-row justify-between text-xs text-[#6B6166] gap-2">
              <div>
                <span className="text-[10px] tracking-widest uppercase text-[#C9A25C] font-semibold block">SHIPPING TO</span>
                <span className="text-[#28192A] font-medium">Bangkok, Thailand</span>
              </div>
              <div>
                <span>Estimated delivery: </span>
                <strong className="text-[#28192A] font-medium">2–4 business days after confirmation</strong>
              </div>
            </div>

          </div>

          {/* Right Column: Perfumer Note & Actions */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Perfumer's note */}
            <div className="bg-[#FFFDF8] border border-[#DAD1C5] p-6 sm:p-8">
              <span className="text-[10px] tracking-[0.2em] uppercase text-[#6B6166] font-medium block mb-3">
                A Note from Your Perfumer
              </span>
              <blockquote className="font-serif text-base sm:text-lg text-[#28192A] italic leading-relaxed">
                “The final blend has been balanced to keep the {composition.topNote} bright, the {composition.heartNote} soft, and the {composition.baseNote} warm without overpowering the floral heart.”
              </blockquote>
              <div className="mt-4 text-xs tracking-wider text-[#6B6166] flex items-center gap-2">
                <span className="w-4 h-px bg-[#DAD1C5]"></span>
                <span>Scentify Perfume Studio</span>
              </div>
            </div>

            {/* Confirmation Box */}
            <div className="bg-[#FBF7F0] border border-[#DAD1C5] p-6 sm:p-8 space-y-5">
              <div>
                <h3 className="font-serif text-lg text-[#28192A]">
                  Please check your fragrance details before confirming.
                </h3>
                <p className="text-xs text-[#6B6166] mt-2 font-light leading-relaxed">
                  Need a change? You can request an adjustment before we begin final preparation.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={handleConfirm}
                  className="w-full py-4 bg-[#28192A] text-[#FFFDF8] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#3D2540] transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-[#C9A25C]" />
                  <span>Confirm & Prepare for Shipping</span>
                </button>

                <button
                  onClick={onRequestChange}
                  className="w-full py-3.5 bg-transparent border border-[#28192A] text-[#28192A] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#28192A]/5 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Request a Change</span>
                </button>
              </div>

              <p className="text-[11px] text-[#6B6166]/80 text-center font-light pt-2">
                After confirmation, your order will move to preparation and shipping.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
