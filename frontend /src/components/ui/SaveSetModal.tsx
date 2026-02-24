import { useState, useEffect } from "react";
import Modal from "./Modal";

interface SaveSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  initialName?: string;
  title?: string;
  existingNames?: string[];
}

const SaveSetModal = ({
  isOpen,
  onClose,
  onSave,
  initialName = "",
  title = "Save as Favourite Set",
  existingNames,
}: SaveSetModalProps) => {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (isOpen) setName(initialName);
  }, [isOpen, initialName]);

  const isDuplicate =
    existingNames?.some(
      (n) => n.trim().toLowerCase() === name.trim().toLowerCase()
    ) ?? false;
  const isTooLong = name.trim().length > 50;
  const isInvalid = !name.trim() || isDuplicate || isTooLong;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isInvalid) {
      onSave(name.trim());
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit}>
        <label
          htmlFor="bag-name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Set Name
        </label>
        <input
          id="bag-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Weekend Round"
          autoFocus
          className="input-field"
        />
        {isDuplicate && (
          <p className="text-red-500 text-xs mt-1">
            A bag with this name already exists.
          </p>
        )}
        {isTooLong && (
          <p className="text-red-500 text-xs mt-1">
            Name must be 50 characters or fewer.
          </p>
        )}
        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isInvalid} className="btn-primary">
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SaveSetModal;
