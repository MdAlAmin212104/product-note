/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { render } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { getNotes, updateNotes } from './utils';

export default async () => {
  render(<Extension />, document.body);
}


type Note = {
  id: number | null; // allow null for initial state
  title: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
};


function validateForm({ title, description }) {
  return {
    isValid: Boolean(title) && Boolean(description),
    errors: {
      title: !title,
      description: !description,
    },
  };
}


function Extension() {
  const { i18n, close, data, intents } = shopify;
  const [note, setnote] = useState<Note>({
    id: null,
    title: "",
    description: "",
  });
  const noteId = intents?.launchUrl
    ? new URL(intents?.launchUrl)?.searchParams?.get("noteId")
    : null;
  const [allnotes, setAllnotes] = useState([]);
  const [formErrors, setFormErrors] = useState(null);
  const { title, description } = note;
  const [loading, setLoading] = useState(noteId ? true : false);
  const isEditing = Boolean(noteId);

  useEffect(() => {
    getNotes(data.selected[0].id).then((notes) => {
      setAllnotes(notes || []);
      setLoading(false);
    });
  }, []);



  useEffect(() => {
    if (noteId) {
      // If opened from the block extension, find the issue that's being edited
      const editingIssue = allnotes.find(({ id }) => `${id}` === noteId);
      if (editingIssue) {
        // Set the issue's ID in the state
        setnote(editingIssue);
      }
    }
  }, [noteId, allnotes]);

  const onSubmit = useCallback(async () => {
    const { isValid, errors } = validateForm(note);
    setFormErrors(errors);

    if (!isValid) return;

    const productId = data.selected[0].id;


    const notesCopy = [...allnotes];

  
    const existingIndex = notesCopy.findIndex((n: any) => n.id === note.id);

    let updatedNotes: Note[];

    if (existingIndex !== -1) {
      // 🔁 Update existing note
      notesCopy[existingIndex] = {
        ...note,
        updatedAt: new Date().toISOString(),
      };
      updatedNotes = notesCopy;
    } else {
      // 🆕 Create new note with id + createdAt
      const newNote: Note = {
        ...note,
        id: Date.now(),
        createdAt: new Date().toISOString(),
      };
      updatedNotes = [...notesCopy, newNote];
    }

    try {
      await updateNotes(productId, updatedNotes);
      close();
    } catch (err) {
      console.error("❌ Failed to update notes:", err);
    }
  }, [note, data.selected, allnotes, close]);



  if (loading) {
    return <></>;
  }

  return (
    // The AdminAction component provides an API for setting the title and actions of the Action extension wrapper.
    <s-admin-action heading={
      isEditing
        ? i18n.translate("edit-note-heading")
        : i18n.translate("create-note-heading")
    }>
      <s-text-field
        value={title}
        error={
          formErrors?.title ? i18n.translate("note-title-error") : undefined
        }
        onChange={(event: any) =>
          setnote((prev) => ({ ...prev, title: event.target.value }))
        }
        label={i18n.translate("note-title-label")}
        maxLength={50}
      />
      <s-stack paddingBlockStart='small'>
        <s-text-area
          value={description}
          error={
            formErrors?.description
              ? i18n.translate("note-description-error")
              : undefined
          }
          onChange={(event: any) =>
            setnote((prev) => ({ ...prev, description: event.target.value }))
          }
          label={i18n.translate("note-description-label")}
          maxLength={300}
        />
      </s-stack>
      <s-button slot="primary-action" onClick={onSubmit}>  {isEditing
        ? "Update"
        : "Create"}</s-button>
      <s-button slot="secondary-actions" onClick={() => {
        
        close();
      }}>{i18n.translate("note-cancel-button")}</s-button>
    </s-admin-action>
  );
}