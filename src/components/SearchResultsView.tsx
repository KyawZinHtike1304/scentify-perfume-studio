import React, { useState, useMemo, useEffect } from 'react';
import { Search, Sparkles, ArrowRight, X, SlidersHorizontal, FlaskConical, Layers, Info } from 'lucide-react';
import { SCENT_FAMILIES } from '../data/perfumeData';
import { ViewMode, Ingredient, ScentFamily } from '../types';

interface SearchResultsViewProps {
  initialQuery: string;
  onSearch: (query: string) => void;
  onNavigate: (view: ViewMode) => void;
  onSelectIngredientToScentify: (ingredient: Ingredient) => void;
  scentFamilies?: ScentFamily[];
}

function getNoteTier(ingredient: Ingredient): 'Top Note' | 'Heart Note' | 'Base Note' {
  const fam = (ingredient.familyId || ingredient.familyName || '').toLowerCase();
  if (fam.includes('citrus') || fam.includes('fresh')) return 'Top Note';
  if (fam.includes('floral') || fam.includes('fruity')) return 'Heart Note';
  return 'Base Note';
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  initialQuery,
  onSearch,
  onNavigate,
  onSelectIngredientToScentify,
  scentFamilies = SCENT_FAMILIES,
}) => {
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [selectedFamilyFilter, setSelectedFamilyFilter] = useState<string>('all');
  const [selectedTierFilter, setSelectedTierFilter] = useState<'all' | 'Top Note' | 'Heart Note' | 'Base Note'>('all');

  // Keep searchInput in sync if initialQuery changes from outside
  useEffect(() => {
    setSearchInput(initialQuery);
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    onSearch(trimmed);
  };

  const handleClear = () => {
    setSearchInput('');
    onSearch('');
  };

  const handleQuickSuggestion = (term: string) => {
    setSearchInput(term);
    onSearch(term);
  };

  // All available scents / ingredients flattened
  const allIngredients: Ingredient[] = useMemo(() => {
    return scentFamilies.flatMap((f) => f.ingredients);
  }, [scentFamilies]);

  // Query matching
  const query = initialQuery.toLowerCase().trim();

  const matchedIngredients = useMemo(() => {
    return allIngredients.filter((ing) => {
      const matchQuery =
        !query ||
        ing.name.toLowerCase().includes(query) ||
        ing.description.toLowerCase().includes(query) ||
        ing.familyName.toLowerCase().includes(query) ||
        getNoteTier(ing).toLowerCase().includes(query);

      const matchFamily =
        selectedFamilyFilter === 'all' || ing.familyId === selectedFamilyFilter;

      const matchTier =
        selectedTierFilter === 'all' || getNoteTier(ing) === selectedTierFilter;

      return matchQuery && matchFamily && matchTier;
    });
  }, [allIngredients, query, selectedFamilyFilter, selectedTierFilter]);

  // Matched families for contextual discovery
  const matchedFamilies = useMemo(() => {
    if (!query) return scentFamilies;
    return scentFamilies.filter((f) => {
      const matchName = f.name.toLowerCase().includes(query);
      const matchDesc = f.description.toLowerCase().includes(query);
      const matchNotes = f.notes.some((n) => n.toLowerCase().includes(query));
      return matchName || matchDesc || matchNotes;
    });
  }, [scentFamilies, query]);

  const popularSuggestions = [
    'Bergamot',
    'Jasmine',
    'Sandalwood',
    'Oud',
    'Rose',
    'Citrus',
    'Floral',
    'Woody',
    'Vanilla',
    'Lavender',
    'Grapefruit',
    'Fresh',
  ];

  return (
    <div className="min-h-screen bg-[#FBF7F0] text-[#28192A] pb-24">
      
      {/* Top Breadcrumb Bar */}
      <div className="border-b border-[#DAD1C5]/40 bg-[#FBF7F0]/80 sticky top-20 z-30 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#6B6166]">
              <button
                onClick={() => onNavigate('home')}
                className="hover:text-[#28192A] transition-colors cursor-pointer"
              >
                Home
              </button>
              <span>/</span>
              <button
                onClick={() => onNavigate('collection')}
                className="hover:text-[#28192A] transition-colors cursor-pointer"
              >
                Ingredient Library
              </button>
              <span>/</span>
              <span className="text-[#28192A] font-medium">Search Available Scents</span>
            </div>

            <button
              onClick={() => onNavigate('scentify')}
              className="text-xs uppercase tracking-wider text-[#C9A25C] hover:text-[#28192A] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Go to Crafting Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Full-Page Search Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#C9A25C] font-semibold block mb-2">
            STUDIO BOTANICAL ARCHIVE
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#28192A] font-medium mb-3">
            {initialQuery.trim() ? (
              <>
                Available Scents matching <span className="italic font-normal font-serif">"{initialQuery}"</span>
              </>
            ) : (
              'Available Scents & Botanical Notes'
            )}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6166] max-w-xl mx-auto font-light leading-relaxed">
            Search our library of wild-harvested botanicals, rare essences, and accords. Choose any note to begin composing your personal 3-ingredient bespoke perfume.
          </p>
        </div>

        {/* Dedicated Full Page Search Input Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="max-w-2xl mx-auto mb-5 relative"
        >
          <div className="relative flex items-center bg-[#FBF7F0] border-2 border-[#28192A] shadow-md focus-within:ring-2 focus-within:ring-[#C9A25C]/50 transition-all">
            <div className="pl-4 sm:pl-5 text-[#6B6166]">
              <Search className="w-5 h-5 stroke-[1.8]" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search available scents: bergamot, jasmine, sandalwood, oud..."
              className="w-full py-3.5 sm:py-4 px-3 sm:px-4 bg-transparent font-serif text-base sm:text-lg text-[#28192A] placeholder-[#6B6166]/50 focus:outline-none"
              autoFocus
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-[#6B6166] hover:text-[#28192A] transition-colors cursor-pointer"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="m-1.5 px-5 sm:px-7 py-2.5 sm:py-3 bg-[#28192A] text-[#FFFDF8] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#3D2540] transition-colors shrink-0 shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5 text-[#C9A25C]" />
              <span>Search</span>
            </button>
          </div>
          <p className="text-[11px] text-[#6B6166] text-center mt-2 font-mono">
            Press <kbd className="px-1.5 py-0.5 bg-[#DAD1C5]/40 text-[#28192A] rounded-xs text-[10px]">Enter ↵</kbd> to refresh search results across full page
          </p>
        </form>

        {/* Popular Suggestion Pills */}
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-8 text-xs">
          <span className="text-[#6B6166] mr-1 text-[11px] uppercase tracking-wider font-mono">Popular:</span>
          {popularSuggestions.map((term) => (
            <button
              key={term}
              onClick={() => handleQuickSuggestion(term)}
              className={`px-3 py-1 text-xs border transition-colors cursor-pointer ${
                initialQuery.toLowerCase() === term.toLowerCase()
                  ? 'bg-[#28192A] text-[#FFFDF8] border-[#28192A]'
                  : 'bg-[#FBF7F0] text-[#28192A] border-[#DAD1C5] hover:border-[#28192A] hover:bg-[#F3EDE2]'
              }`}
            >
              {term}
            </button>
          ))}
        </div>

        {/* Filter Toolbar */}
        <div className="border-t border-b border-[#DAD1C5]/50 py-4 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Family Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[#6B6166] text-[11px] uppercase font-mono mr-1 shrink-0">Family:</span>
            <button
              onClick={() => setSelectedFamilyFilter('all')}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                selectedFamilyFilter === 'all'
                  ? 'bg-[#28192A] text-[#FFFDF8] font-medium'
                  : 'bg-[#FBF7F0] text-[#6B6166] hover:text-[#28192A] border border-[#DAD1C5]'
              }`}
            >
              All Families
            </button>
            {scentFamilies.map((fam) => (
              <button
                key={fam.id}
                onClick={() => setSelectedFamilyFilter(fam.id)}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider whitespace-nowrap transition-colors shrink-0 cursor-pointer ${
                  selectedFamilyFilter === fam.id
                    ? 'bg-[#28192A] text-[#FFFDF8] font-medium'
                    : 'bg-[#FBF7F0] text-[#6B6166] hover:text-[#28192A] border border-[#DAD1C5]'
                }`}
              >
                {fam.name}
              </button>
            ))}
          </div>

          {/* Note Tier Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
            <span className="text-[#6B6166] text-[11px] uppercase font-mono mr-1">Pyramid:</span>
            {(['all', 'Top Note', 'Heart Note', 'Base Note'] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTierFilter(tier)}
                className={`px-2.5 py-1 text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                  selectedTierFilter === tier
                    ? 'bg-[#C9A25C] text-[#28192A] font-semibold'
                    : 'bg-transparent text-[#6B6166] hover:text-[#28192A]'
                }`}
              >
                {tier === 'all' ? 'All Notes' : tier}
              </button>
            ))}
          </div>
        </div>

        {/* Counter & Status Header */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs uppercase font-mono tracking-widest text-[#6B6166]">
            Showing <strong className="text-[#28192A]">{matchedIngredients.length}</strong> available scent{matchedIngredients.length === 1 ? '' : 's'}
            {query && <span> for "<span className="text-[#28192A]">{query}</span>"</span>}
          </span>
          <span className="text-[11px] text-[#6B6166] hidden sm:inline">
            Each bespoke perfume accepts up to 3 ingredients
          </span>
        </div>

        {/* No Results Fallback */}
        {matchedIngredients.length === 0 ? (
          <div className="text-center py-20 px-4 bg-[#FBF7F0] border border-[#DAD1C5] max-w-2xl mx-auto my-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#F3EDE2] border border-[#DAD1C5] flex items-center justify-center text-[#6B6166]">
              <Search className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#28192A] font-medium mb-2">
              No scents found matching "{initialQuery}"
            </h3>
            <p className="text-xs sm:text-sm text-[#6B6166] max-w-md mx-auto mb-6 font-light leading-relaxed">
              We couldn't find an exact match in our botanical archive. Try searching for broader keywords like <em>Citrus</em>, <em>Floral</em>, <em>Woody</em>, or clear your filters to view all available essences.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleClear}
                className="px-6 py-2.5 bg-[#28192A] text-[#FFFDF8] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#3D2540] transition-colors cursor-pointer"
              >
                Clear Search &amp; View All
              </button>
              <button
                onClick={() => onNavigate('collection')}
                className="px-6 py-2.5 border border-[#28192A] text-[#28192A] text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#28192A] hover:text-[#FFFDF8] transition-colors cursor-pointer"
              >
                Explore Scent Families
              </button>
            </div>
          </div>
        ) : (
          /* Grid of Available Scents */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {matchedIngredients.map((ing) => {
              const tier = getNoteTier(ing);
              return (
                <div
                  key={ing.id}
                  className="bg-[#FBF7F0] border border-[#DAD1C5] hover:border-[#28192A] transition-all duration-200 p-6 flex flex-col justify-between group shadow-2xs hover:shadow-md"
                >
                  <div>
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#6B6166] bg-[#DAD1C5]/30 px-2 py-0.5 border border-[#DAD1C5]/40">
                        {ing.familyName}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-mono text-[#C9A25C] tracking-wider font-semibold">
                          {tier}
                        </span>
                        {ing.isPopular && (
                          <span
                            title="Studio Signature Essence"
                            className="text-[#C9A25C] flex items-center"
                          >
                            <Sparkles className="w-3.5 h-3.5 fill-[#C9A25C]" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Scent Title */}
                    <h3 className="font-serif text-2xl text-[#28192A] font-medium group-hover:text-[#C9A25C] transition-colors mb-2">
                      {ing.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-[#6B6166] font-light leading-relaxed mb-6">
                      {ing.description}
                    </p>
                  </div>

                  {/* Action CTA */}
                  <div className="pt-4 border-t border-[#DAD1C5]/40">
                    <button
                      onClick={() => onSelectIngredientToScentify(ing)}
                      className="w-full py-2.5 px-3 bg-[#28192A] text-[#FFFDF8] hover:bg-[#3D2540] text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#C9A25C]" />
                      <span>Add to Formulation</span>
                      <ArrowRight className="w-3 h-3 text-[#C9A25C] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Scent Families Section */}
        {matchedFamilies.length > 0 && (
          <section className="mt-16 pt-12 border-t border-[#DAD1C5]/50">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C9A25C] font-semibold block mb-1">
                  Harmonies &amp; Accords
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#28192A] font-medium">
                  Related Scent Families
                </h2>
              </div>
              <button
                onClick={() => onNavigate('collection')}
                className="text-xs text-[#28192A] hover:text-[#C9A25C] underline font-medium cursor-pointer"
              >
                View full library →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchedFamilies.map((fam) => (
                <div
                  key={fam.id}
                  onClick={() => {
                    setSelectedFamilyFilter(fam.id);
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  className="bg-[#FBF7F0] border border-[#DAD1C5] p-6 hover:border-[#28192A] transition-all cursor-pointer group shadow-2xs hover:shadow-md"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono text-[#C9A25C] font-bold">
                      {fam.number}
                    </span>
                    <span className="text-xs font-serif italic text-[#6B6166]">
                      {fam.subtitle}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl text-[#28192A] font-medium group-hover:text-[#C9A25C] transition-colors mb-2">
                    {fam.name} Family
                  </h3>
                  <p className="text-xs text-[#6B6166] font-light mb-4 line-clamp-2 leading-relaxed">
                    {fam.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#DAD1C5]/30">
                    {fam.notes.map((n) => (
                      <span
                        key={n}
                        className="text-[10px] uppercase font-mono tracking-wider text-[#28192A] bg-[#DAD1C5]/20 px-2 py-0.5 border border-[#DAD1C5]/40"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bottom Banner */}
        <div className="mt-20 p-8 sm:p-12 bg-[#28192A] text-[#FBF7F0] text-center border border-[#DAD1C5]">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#C9A25C] font-semibold block mb-2">
            The Bespoke Studio Experience
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#FBF7F0] font-medium mb-3">
            Ready to craft your signature scent?
          </h2>
          <p className="text-xs sm:text-sm text-[#DAD1C5] max-w-xl mx-auto font-light mb-6 leading-relaxed">
            Select up to 3 notes from our library, choose your luxury flacon, and our master perfumers in Chiang Rai will hand-blend your formulation.
          </p>
          <button
            onClick={() => onNavigate('scentify')}
            className="px-8 py-3.5 bg-[#C9A25C] text-[#28192A] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#d6b26e] transition-colors inline-flex items-center gap-2 cursor-pointer shadow-md"
          >
            <FlaskConical className="w-4 h-4" />
            <span>Open Scentify Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
