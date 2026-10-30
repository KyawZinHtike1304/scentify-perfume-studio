import React, { useState, useMemo } from 'react';
import { Search, X, Sparkles, ArrowRight, CornerDownLeft, ExternalLink } from 'lucide-react';
import { SCENT_FAMILIES } from '../data/perfumeData';
import { Ingredient, ViewMode, ScentFamily } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIngredient?: (ingredient: Ingredient) => void;
  onNavigate: (view: ViewMode) => void;
  onSearchFullPage?: (query: string) => void;
  scentFamilies?: ScentFamily[];
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectIngredient,
  onNavigate,
  onSearchFullPage,
  scentFamilies = SCENT_FAMILIES,
}) => {
  const [query, setQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<string>('all');

  const allIngredients: Ingredient[] = useMemo(() => {
    return scentFamilies.flatMap((f) => f.ingredients);
  }, [scentFamilies]);

  const filteredIngredients = useMemo(() => {
    return allIngredients.filter((item: Ingredient) => {
      const matchQuery =
        !query ||
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.familyName.toLowerCase().includes(query.toLowerCase());
      const matchFamily = selectedFamily === 'all' || item.familyId === selectedFamily;
      return matchQuery && matchFamily;
    });
  }, [allIngredients, query, selectedFamily]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (onSearchFullPage) {
      onSearchFullPage(trimmed);
    } else {
      onNavigate('search');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#28192A]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#FBF7F0] border border-[#DAD1C5] max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[85vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-[#6B6166] hover:text-[#28192A] transition-colors cursor-pointer"
          aria-label="Close search"
        >
          <X className="w-5 h-5" />
        </button>

        <span className="text-[10px] uppercase font-mono tracking-widest text-[#C9A25C] font-semibold block mb-1">
          STUDIO BOTANICAL ARCHIVE
        </span>
        <h3 className="font-serif text-2xl text-[#28192A] mb-4">Search Available Scents</h3>

        {/* Search input with Form for Enter key */}
        <form onSubmit={handleSearchSubmit} className="mb-3">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6166]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search bergamot, jasmine, sandalwood, oud..."
              autoFocus
              className="w-full bg-[#FBF7F0] border border-[#DAD1C5] pl-10 pr-24 py-3 text-xs text-[#28192A] placeholder-[#6B6166]/60 focus:outline-none focus:border-[#28192A]"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#28192A] text-[#FFFDF8] hover:bg-[#3D2540] text-[10px] uppercase tracking-wider font-medium flex items-center gap-1 transition-colors cursor-pointer"
              title="Show results in full page"
            >
              <span>Search</span>
              <CornerDownLeft className="w-3 h-3 text-[#C9A25C]" />
            </button>
          </div>
          <p className="text-[10px] text-[#6B6166] mt-1.5 flex items-center justify-between">
            <span>Press <kbd className="px-1 py-0.5 bg-[#DAD1C5]/50 text-[#28192A] rounded-xs font-mono font-semibold">Enter ↵</kbd> to view all available scents in full page</span>
            <button
              type="submit"
              className="text-[#C9A25C] hover:text-[#28192A] underline cursor-pointer inline-flex items-center gap-1 font-medium"
            >
              <span>Open in Full Page</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </p>
        </form>

        {/* Scent family filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 border-b border-[#DAD1C5]/40 text-xs">
          <button
            onClick={() => setSelectedFamily('all')}
            className={`px-3 py-1 rounded-none text-[11px] uppercase tracking-wider transition-colors cursor-pointer shrink-0 ${
              selectedFamily === 'all'
                ? 'bg-[#28192A] text-[#FFFDF8]'
                : 'bg-[#FBF7F0] text-[#6B6166] hover:text-[#28192A] border border-[#DAD1C5]'
            }`}
          >
            All Families
          </button>
          {scentFamilies.map((fam) => (
            <button
              key={fam.id}
              onClick={() => setSelectedFamily(fam.id)}
              className={`px-3 py-1 rounded-none text-[11px] uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                selectedFamily === fam.id
                  ? 'bg-[#28192A] text-[#FFFDF8]'
                  : 'bg-[#FBF7F0] text-[#6B6166] hover:text-[#28192A] border border-[#DAD1C5]'
              }`}
            >
              {fam.name}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredIngredients.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#6B6166]">
              No botanical notes found matching "{query}".
              <div className="mt-3">
                <button
                  onClick={handleSearchSubmit}
                  className="text-[#28192A] underline hover:text-[#C9A25C] text-xs font-medium cursor-pointer"
                >
                  Search on full page anyway →
                </button>
              </div>
            </div>
          ) : (
            filteredIngredients.map((ing: Ingredient) => (
              <div
                key={ing.id}
                className="p-3 bg-[#FBF7F0] hover:bg-[#F3EDE2] border border-[#DAD1C5]/70 flex items-center justify-between gap-3 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-sm text-[#28192A] font-medium">{ing.name}</span>
                    <span className="text-[10px] uppercase font-mono text-[#C9A25C]">{ing.familyName}</span>
                  </div>
                  <p className="text-[11px] text-[#6B6166] line-clamp-1">{ing.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onSelectIngredient && (
                    <button
                      onClick={() => {
                        onSelectIngredient(ing);
                        onClose();
                        onNavigate('scentify');
                      }}
                      className="px-2.5 py-1.5 bg-[#28192A] text-[#FFFDF8] hover:bg-[#3D2540] text-[11px] uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-[#C9A25C]" />
                      <span>Add to Scent</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom CTA Bar */}
        <div className="mt-4 pt-3 border-t border-[#DAD1C5]/40 flex items-center justify-between text-xs">
          <span className="text-[#6B6166]">
            Showing {filteredIngredients.length} notes
          </span>
          <button
            onClick={handleSearchSubmit}
            className="text-[#28192A] underline hover:text-[#C9A25C] flex items-center gap-1 cursor-pointer font-medium"
          >
            <span>View All Available Scents in Full Page</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
