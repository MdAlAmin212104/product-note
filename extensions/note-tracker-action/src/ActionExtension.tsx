/* eslint-disable @typescript-eslint/no-explicit-any */
import {render} from 'preact';
import {useCallback, useEffect, useState} from 'preact/hooks';
import { getNotes, updateNotes } from './utils';

export default async () => {
  render(<Extension />, document.body);
}


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
    const {i18n, close, data} = shopify;
    const [note, setnote] = useState({ title: "", description: "" });
    const [allnotes, setAllnotes] = useState([]);
    const [formErrors, setFormErrors] = useState(null);
    const { title, description } = note;

    useEffect(() => {
      getNotes(data.selected[0].id).then((notes) =>
        setAllnotes(notes || []),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSubmit = useCallback(async () => {
      const { isValid, errors } = validateForm(note);
      setFormErrors(errors);

      if (isValid) {
        // Commit changes to the database
        await updateNotes(data.selected[0].id, [...allnotes, note]);
        close();
      }
    }, [note, data.selected, allnotes, close]);

  return (
    // The AdminAction component provides an API for setting the title and actions of the Action extension wrapper.
    <s-admin-action>
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
        <s-box padding-block-start="large">
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
            max-length={300}
          />
        </s-box>
      <s-button slot="primary-action" onClick={onSubmit}>{i18n.translate("note-create-button")}</s-button>
      <s-button slot="secondary-actions" onClick={() => {
          console.log('closing');
          close();
      }}>{i18n.translate("note-cancel-button")}</s-button>
    </s-admin-action>
  );
}