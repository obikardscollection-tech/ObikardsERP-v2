import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Image, Trash2 } from "lucide-react";
import {
  getInventoryPhotoUrl,
  removeInventoryPhoto,
} from "../../../services/inventoryService";

function PhotoPreview({ inventoryId, photo, label, removing, onRemove }) {
  const [source, setSource] = useState("");

  useEffect(() => {
    if (!(photo instanceof File)) {
      setSource(getInventoryPhotoUrl(inventoryId, photo));
      return undefined;
    }

    const objectUrl = URL.createObjectURL(photo);
    setSource(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [inventoryId, photo]);

  return (
    <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
      <img src={source} alt={label} className="aspect-[4/3] w-full object-contain" />
      <button
        type="button"
        onClick={onRemove}
        disabled={removing}
        className="absolute right-2 top-2 rounded-md bg-white p-2 text-rose-600 shadow disabled:opacity-50"
        aria-label={`Supprimer ${label}`}
        title={`Supprimer ${label}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function PhotosSection({ form, setForm, inventoryId }) {
  const [removing, setRemoving] = useState("");

  function update(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function removePhoto(field, photo) {
    if (photo instanceof File || !inventoryId) {
      update(
        field,
        field === "extraPhotos"
          ? form.extraPhotos.filter((entry) => entry !== photo)
          : null
      );
      return;
    }

    try {
      setRemoving(photo);
      const updated = await removeInventoryPhoto(inventoryId, photo);
      update(field, updated[field] || (field === "extraPhotos" ? [] : null));
    } catch (error) {
      toast.error(error?.response?.data?.error || "Impossible de supprimer la photo.");
    } finally {
      setRemoving("");
    }
  }

  return (
    <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
      <div className="mb-6 flex items-center gap-2">
        <Image className="h-5 w-5 text-slate-600" />
        <h2 className="text-xl font-semibold">Photos</h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {[
          { field: "frontPhoto", label: "Photo recto" },
          { field: "backPhoto", label: "Photo verso" },
        ].map(({ field, label }) => (
          <div key={field} className="space-y-3">
            <label className="block text-sm font-medium">{label}</label>
            {form[field] ? (
              <PhotoPreview
                inventoryId={inventoryId}
                photo={form[field]}
                label={label}
                removing={removing === form[field]}
                onRemove={() => removePhoto(field, form[field])}
              />
            ) : null}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => update(field, event.target.files[0] || null)}
              className="w-full rounded-lg border p-3 text-sm"
            />
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <label className="block text-sm font-medium">Photos supplémentaires</label>
        <input
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => update("extraPhotos", [
            ...form.extraPhotos.filter((entry) => typeof entry === "string"),
            ...Array.from(event.target.files || []),
          ])}
          className="w-full rounded-lg border p-3 text-sm"
        />
        {form.extraPhotos.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {form.extraPhotos.map((photo, index) => (
              <PhotoPreview
                key={photo instanceof File ? `${photo.name}-${photo.lastModified}` : photo}
                inventoryId={inventoryId}
                photo={photo}
                label={`Photo supplementaire ${index + 1}`}
                removing={removing === photo}
                onRemove={() => removePhoto("extraPhotos", photo)}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Aucune photo supplementaire.</p>
        )}
      </div>
    </section>
  );
}