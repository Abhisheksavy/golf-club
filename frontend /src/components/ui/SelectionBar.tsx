interface SelectionBarProps {
  count: number;
  onSave: () => void;
  onClear: () => void;
}

const SelectionBar = ({ count, onSave, onClear }: SelectionBarProps) => {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#1e4410] border-t border-[#FBE118]/20 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <span className="font-medium">
          {count} {count === 1 ? "club" : "clubs"} selected
        </span>
        <div className="flex gap-3">
          <button
            onClick={onClear}
            className="px-4 py-1.5 text-sm border border-white/30 rounded-md hover:bg-white/10 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={onSave}
            className="px-4 py-1.5 text-sm bg-[#FBE118] text-[#285610] font-medium rounded-md hover:bg-[#FBE118]/90 transition-colors"
          >
            Save as Set
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectionBar;
