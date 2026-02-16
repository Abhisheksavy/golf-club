import { useState, useEffect } from "react";
import Modal from "./Modal";

interface SaveSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  initialName?: string;
  title?: string;
}

const SaveSetModal = ({
  isOpen,
  onClose,
  onSave,
  initialName = "",
  title = "Save as Favourite Set",
}: SaveSetModalProps) => {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (isOpen) setName(initialName);
  }, [isOpen, initialName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit}>
        <label
          htmlFor="set-name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Set Name
        </label>
        <input
          id="set-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Weekend Round"
          autoFocus
          className="input-field mb-4"
        />
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={!name.trim()} className="btn-primary">
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SaveSetModal;
