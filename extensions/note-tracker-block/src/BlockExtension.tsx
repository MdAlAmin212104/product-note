import { render } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import { getNotes, updateNotes, Note } from "./utils";

const PAGE_SIZE = 3;

function Extension() {
  const { data, navigation, i18n } = shopify;

  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const productId = data.selected?.[0]?.id;
  const notesCount = notes.length;
  const totalPages = Math.ceil(notesCount / PAGE_SIZE);

  // Fetch metafield data (notes)
  useEffect(() => {
    (async function fetchProductNotes() {
      if (!productId) return;
      try {
        const parsedNotes = await getNotes(productId);
        setLoading(false);

        if (parsedNotes && Array.isArray(parsedNotes)) {
          setNotes(parsedNotes);
        } else {
          console.log("⚠️ No metafield notes found for this product.");
        }
      } catch (error) {
        console.error("❌ Error fetching product notes:", error);
        setLoading(false);
      }
    })();
  }, [productId]);

  // Pagination logic
  const paginatedNotes = useMemo(() => {
    if (notesCount <= PAGE_SIZE) return notes;
    return notes.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  }, [notesCount, notes, currentPage]);

  // Delete notes
  const handleDelete = async (id: number) => {
    console.log(id, "detelt note click");
    // const newNotes = notes.filter((note) => note.id !== id);
    // setNotes(newNotes);
    // await updateNotes(productId, newNotes);
  };

  // Submit updated notes
  // const onSubmit = (event: SubmitEvent) => {
  //   event.preventDefault();
  //   event.stopPropagation();
  //   event.waitUntil(updateNotes(productId, notes));
  // };


  if (loading) {
    return (
      <s-stack direction="inline">
        <s-spinner />
      </s-stack>
    );
  }

  return (
    <s-admin-block heading={i18n.translate("name")}>
      <s-form id="Note-form">
        {notes.length ? (
          <>
            <s-table
              id="Note-table"
              paginate={notes.length > PAGE_SIZE}
              onNextPage={() => setCurrentPage(currentPage + 1)}
              onPreviousPage={() => setCurrentPage(currentPage - 1)}
              hasNextPage={currentPage < totalPages}
              hasPreviousPage={currentPage > 1}
            >
              <s-table-header-row>
                <s-table-header listSlot="primary">
                  {i18n.translate("Note-column-heading")}
                </s-table-header>
                <s-table-header>
                  {i18n.translate("status-column-heading")}
                </s-table-header>
                <s-table-header />
                <s-table-header />
              </s-table-header-row>

              <s-table-body>
                {paginatedNotes.map(({ id, title, description }) => (
                  <s-table-row key={id}>
                    <s-table-cell>
                      <s-stack direction="block">
                        <s-text type="strong">{title}</s-text>
                        <s-text>{description}</s-text>
                      </s-stack>
                    </s-table-cell>
                    <s-table-cell>
                      <s-button
                        variant="tertiary"
                        icon="edit"
                        accessibilityLabel={i18n.translate("edit-Note-button")}
                        onClick={() => {
                          const url = `extension:Note-Added-Action?noteId=${id}`;
                          navigation?.navigate(url);
                        }}
                      />
                    </s-table-cell>
                    <s-table-cell>
                      <s-button
                        variant="tertiary"
                        icon="delete"
                        accessibilityLabel={i18n.translate("delete-Note-button")}
                        onClick={() => handleDelete(id!)}
                      />
                    </s-table-cell>
                  </s-table-row>
                ))}
              </s-table-body>
            </s-table>

            <s-button
              onClick={() => {
                const url = `extension:Note-Added-Action`;
                navigation?.navigate(url);
              }}
            >
              {i18n.translate("add-Note-button")}
            </s-button>
          </>
        ) : (
          <s-button
            onClick={() => {
              const url = `extension:Note-Added-Action`;
              navigation?.navigate(url);
            }}
          >
            {i18n.translate("add-Note-button")}
          </s-button>
        )}
      </s-form>
    </s-admin-block>
  );
}

export default async () => {
  render(<Extension />, document.body);
};
