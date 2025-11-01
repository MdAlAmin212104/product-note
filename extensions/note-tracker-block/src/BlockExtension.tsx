import { render } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import { getNotes, Note, updateNotes } from "./utils";

const PAGE_SIZE = 2;

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
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    await updateNotes(productId, newNotes);
  };


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
          <s-grid justifyItems="end" padding="none none small none">
              <s-button
                variant="primary"
                onClick={() => {
                  const url = `extension:Note-Added-Action`;
                  navigation?.navigate(url);
                }}
              >
                {i18n.translate("add-Note-button")}
              </s-button>
            </s-grid>
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

                <s-table-header>Delete</s-table-header>
              </s-table-header-row>

              <s-table-body>
                {paginatedNotes.map(({ id, title, description, createdAt, updatedAt }) => {
                  const updatedTime = updatedAt
                    ? new Date(updatedAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })
                    : createdAt
                      ? new Date(createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })
                      : null;

                  return (
                    <s-table-row key={id}>
                      <s-table-cell>
                        <s-box>
                          <s-heading>{title}</s-heading>
                          <s-paragraph>{description}</s-paragraph>
                          {updatedTime && (
                            <s-badge tone="success">Last updated on {updatedTime}</s-badge>
                          )}
                        </s-box>
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
                  );
                })}
              </s-table-body>
            </s-table>
          </>
        ) : (
          <s-section accessibilityLabel="Empty state section">
            <s-grid gap="base" justifyItems="center" paddingBlock="large-400">
              <s-box maxInlineSize="200px" maxBlockSize="200px">
                <s-image
                  aspectRatio="1/0.5"
                  src="https://cdn.shopify.com/static/images/polaris/patterns/callout.png"
                  alt="A stylized graphic of four characters, each holding a puzzle piece"
                />
              </s-box>
              <s-grid justifyItems="center" maxInlineSize="450px" gap="base">
                <s-stack alignItems="center">
                  <s-heading>Create a New Note</s-heading>
                  <s-paragraph>
                    Add notes to keep important details or reminders about this product.
                  </s-paragraph>
                </s-stack>
                <s-button-group>
                  <s-button slot="primary-action" aria-label="Add a new puzzle" onClick={() => {
                    const url = `extension:Note-Added-Action`;
                    navigation?.navigate(url);
                  }}>
                    {i18n.translate("add-Note-button")}
                  </s-button>
                </s-button-group>
              </s-grid>
            </s-grid>
          </s-section>
        )}
      </s-form>
    </s-admin-block>
  );
}

export default async () => {
  render(<Extension />, document.body);
};
