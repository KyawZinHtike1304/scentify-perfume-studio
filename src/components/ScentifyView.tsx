import React, { useState } from 'react';
import { Check, Plus, ArrowRight, Sparkles, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { Composition, ViewMode, Ingredient } from '../types';
import { SCENT_FAMILIES } from '../data/perfumeData';

interface ScentifyViewProps {
  composition: Composition;
  onUpdateComposition: (comp: Composition) => void;
  onNavigate: (view: ViewMode) => void;
}

export const ScentifyView: React.FC<ScentifyViewProps> = ({
  composition,
  onUpdateComposition,
  onNavigate,
}) => {
  const [notice, setNotice] = useState<string | null>(null);

  // Derive the active selected notes array from composition
  const selectedNotes: string[] = [
    composition.topNote,
    composition.heartNote,
    composition.baseNote,
  ].filter(Boolean);

  const isSelected = (noteName: string) => selectedNotes.includes(noteName);

  const handleToggleIngredient = (ingName: string) => {
    if (isSelected(ingName)) {
      // Deselecting: remove from array
      const remaining = selectedNotes.filter((n) => n !== ingName);
      onUpdateComposition({
        ...composition,
        topNote: remaining[0] || '',
        heartNote: remaining[1] || '',
        baseNote: remaining[2] || '',
      });
      setNotice(null);
    } else {
      // Trying to select: enforce maximum 3
      if (selectedNotes.length < 3) {
        const next = [...selectedNotes, ingName];
        onUpdateComposition({
          ...composition,
          topNote: next[0] || '',
          heartNote: next[1] || '',
          baseNote: next[2] || '',
        });
        setNotice(null);
      } else {
        // Already 3 chosen: swap the 3rd note
        const replaced = [selectedNotes[0], selectedNotes[1], ingName];
        onUpdateComposition({
          ...composition,
          topNote: replaced[0] || '',
          heartNote: replaced[1] || '',
          baseNote: replaced[2] || '',
        });
        setNotice(`Maximum 3 notes: replaced "${selectedNotes[2]}" with "${ingName}".`);
        setTimeout(() => setNotice(null), 3500);
      }
    }
  };

  const handleResetToDefault = () => {
    onUpdateComposition({
      ...composition,
      topNote: 'Bergamot',
      heartNote: 'Jasmine',
      baseNote: 'Sandalwood',
    });
    setNotice(null);
  };

  const getHarmonicDescription = () => {
    if (selectedNotes.length === 0) {
      return 'Select any 3 botanical notes to formulate your bespoke personal fragrance.';
    }
    const top = selectedNotes[0] ? `A luminous ${selectedNotes[0].toLowerCase()} opening` : 'A crisp opening';
    const heart = selectedNotes[1] ? `a rich ${selectedNotes[1].toLowerCase()} heart` : 'a delicate heart';
    const base = selectedNotes[2] ? `and a lingering ${selectedNotes[2].toLowerCase()} finish.` : 'and a warm finish.';
    return `${top}, ${heart}, ${base}`;
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] pb-36">
      
      {/* Top Header Section */}
      <section className="pt-12 sm:pt-16 pb-10 border-b border-[#DAD1C5]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7">
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#6B6166] font-medium block mb-3">
                Scentify Studio / 01
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#28192A] tracking-tight leading-[1.1]">
                Create your own <br />perfume.
              </h1>
              <p className="text-sm sm:text-base text-[#6B6166] font-light mt-4 max-w-md">
                A fragrance with your own signature, composed one ingredient at a time.
              </p>
            </div>

            {/* Right Bottle Artwork */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="p-3 bg-[#FBF7F0]/60 rounded-xl border border-[#DAD1C5]/30">
                <img
                  src="/assets/botanicals/hero_bottles.png"
                  alt="Scentify formulation bottles"
                  className="max-h-48 sm:max-h-56 object-contain"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Subhead: Find your perfect notes matching Figma */}
      <section className="py-8 border-b border-[#DAD1C5]/30 bg-[#FBF7F0]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C9A25C] font-semibold block mb-1">
                The Ingredient Library
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#28192A]">
                Find your perfect notes.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#6B6166] max-w-md font-light leading-relaxed">
              Select any ingredients you love within each scent family. Your choices form a fragrance that is entirely yours.
            </p>
          </div>

          {/* Replacement Notice Alert */}
          {notice && (
            <div className="mt-4 p-2.5 bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2 animate-in fade-in duration-150">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{notice}</span>
            </div>
          )}
        </div>
      </section>

      {/* Scent Families Formulation Section — All 6 Families Displayed in Sequence */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {SCENT_FAMILIES.map((family) => (
          <div
            key={family.id}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start border-b border-[#DAD1C5]/40 pb-16"
          >
            {/* Family Metadata & Botanical Study */}
            <div className="lg:col-span-4 flex items-start gap-6">
              <div className="flex-1">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#6B6166] font-medium block">
                  {family.number} / SCENT FAMILY
                </span>
                <h3 className="font-serif text-3xl text-[#28192A] mt-1">
                  {family.name}
                </h3>
                <p className="text-xs text-[#6B6166] mt-0.5 italic">
                  {family.subtitle}
                </p>
                <p className="text-xs text-[#6B6166] font-light mt-2 leading-relaxed">
                  {family.description}
                </p>
              </div>

              <div className="w-24 h-24 shrink-0 flex items-center justify-center p-1 bg-[#FBF7F0] border border-[#DAD1C5]/40">
                <img
                  src={family.image}
                  alt={`${family.name} Botanical Study`}
                  className="max-h-full max-w-full object-contain filter drop-shadow-2xs"
                />
              </div>
            </div>

            {/* Complete Ingredients List for this family */}
            <div className="lg:col-span-8 space-y-3">
              {family.ingredients.map((item, idx) => {
                const selected = isSelected(item.name);
                const itemNum = String(idx + 1).padStart(2, '0');
                
                // Which slot in the 3 notes is this?
                const noteIndex = selectedNotes.indexOf(item.name);
                const roleLabel = noteIndex === 0 ? 'Top Note' : noteIndex === 1 ? 'Heart Note' : noteIndex === 2 ? 'Base Note' : null;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleIngredient(item.name)}
                    className={`p-5 rounded-none border transition-all cursor-pointer flex items-center justify-between group ${
                      selected
                        ? 'border-[#C9A25C] bg-[#FFFDF8] shadow-xs ring-1 ring-[#C9A25C]/40'
                        : 'border-[#DAD1C5]/60 bg-[#FFFDF8] hover:border-[#DAD1C5]'
                    }`}
                  >
                    <div className="flex items-baseline gap-5">
                      <span className="text-xs font-mono text-[#6B6166]/70">{itemNum}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-lg text-[#28192A] group-hover:text-[#C9A25C] transition-colors">
                            {item.name}
                          </h4>
                          {roleLabel && (
                            <span className="text-[10px] font-mono tracking-wider uppercase bg-[#28192A] text-[#FFFDF8] px-2 py-0.5">
                              {roleLabel}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#6B6166] font-light mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`w-8 h-8 flex items-center justify-center transition-colors ${
                        selected
                          ? 'text-[#C9A25C]'
                          : 'text-[#6B6166] group-hover:text-[#28192A]'
                      }`}
                      aria-label={selected ? `Deselect ${item.name}` : `Select ${item.name}`}
                    >
                      {selected ? (
                        <Check className="w-5 h-5 stroke-[2]" />
                      ) : (
                        <Plus className="w-5 h-5 stroke-[1.5]" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Bottom Composition Bar matching Figma */}
      <aside
        aria-label="Selected custom perfume composition bar"
        className="fixed bottom-0 inset-x-0 z-30 bg-[#FBF7F0]/95 backdrop-blur-md border-t border-[#DAD1C5] py-4 px-4 sm:px-6 lg:px-8 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#6B6166] font-medium">
                Your Composition / 0{selectedNotes.length} of 03 Ingredients
              </span>
              <span className="text-[10px] font-mono text-[#C9A25C] uppercase">
                {selectedNotes.length === 3 ? '✓ Complete' : `(Select ${3 - selectedNotes.length} more)`}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <h3 className="font-serif text-xl sm:text-2xl text-[#28192A]">
                {selectedNotes.length > 0 ? selectedNotes.join(' · ') : 'No notes selected yet'}
              </h3>
            </div>
            <p className="text-xs text-[#6B6166] font-light mt-0.5">
              {getHarmonicDescription()}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleResetToDefault}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs text-[#6B6166] hover:text-[#28192A]"
              title="Reset to default (Bergamot · Jasmine · Sandalwood)"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={() => onNavigate('review-fragrance')}
              disabled={selectedNotes.length === 0}
              className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 bg-[#28192A] text-[#FFFDF8] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#3D2540] transition-colors shadow-sm disabled:opacity-50"
            >
              <span>Continue to bottle</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </aside>

    </div>
  );
};
