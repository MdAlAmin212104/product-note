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
    return [...notes].slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  }, [notesCount, notes, currentPage]);

  // Delete notes
  const handleDelete = async (id: number) => {
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    await updateNotes(productId, newNotes);
  };
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

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
          <s-stack direction="inline" justifyContent="space-between"  paddingBlockEnd="small">
              <s-heading>Note History</s-heading>
              <div style={{marginBottom: "10px"}}>
                <s-button
                variant="primary"
                onClick={() => {
                  const url = `extension:Note-Added-Action`;
                  navigation?.navigate(url);
                }}
              >
                {i18n.translate("add-Note-button")}
              </s-button>
              </div>
              
            </s-stack>
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
                  Edit
                </s-table-header>

                <s-table-header>Delete</s-table-header>
              </s-table-header-row>

              <s-table-body>
                {paginatedNotes.map(({ id, title, description, createdAt, updatedAt }) => {
                  const getFormattedTime = (updatedAt?: string, createdAt?: string) => {
                    const date = updatedAt ? new Date(updatedAt) : createdAt ? new Date(createdAt) : null;
                    if (!date) return null;

                    const now = new Date();
                    const diffMs = now.getTime() - date.getTime();
                    const diffMinutes = Math.floor(diffMs / (1000 * 60));
                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                    // const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

                    if (diffMinutes < 1) return "Just now";
                    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
                    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

                    // More than 1 day old → show formatted date
                    return date.toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    });
                  };

                  const updatedTime = getFormattedTime(updatedAt, createdAt);

                  // If delete confirmation is active for this row
                  if (deleteConfirmId === id) {
                    return (
                      <s-table-row key={id}>
                        <s-table-cell>
                          <s-stack direction="inline" gap="base" alignItems="center">
                            <s-paragraph>Are you sure you want to delete <s-chip>
                              {title.split(" ").slice(0, 3).join(" ")}
                              {title.split(" ").length > 3 && "..."}
                            </s-chip>
                              ? This action cannot be undone.</s-paragraph>
                            <s-button
                              variant="primary"
                              tone="critical"
                              onClick={() => {
                                handleDelete(id!);
                                setDeleteConfirmId(null);
                              }}
                            >
                              Confirm Delete
                            </s-button>
                            <s-button
                              variant="secondary"
                              onClick={() => setDeleteConfirmId(null)}
                            >
                              Cancel
                            </s-button>
                          </s-stack>
                        </s-table-cell>
                      </s-table-row>
                    );
                  }

                  // Normal row display
                  return (
                    <s-table-row key={id}>
                      <s-table-cell>
                        <s-box>
                          <s-heading>{title}</s-heading>
                          <s-paragraph>{description}</s-paragraph>
                          {updatedTime && (
                            <s-badge tone="success">
                              Last updated {updatedTime}
                            </s-badge>
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
                          onClick={() => setDeleteConfirmId(id!)}
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
                  src="https://cdn.shopify.com/s/files/1/2376/3301/products/emptystate-files.png"
                  alt="Create a New Note"
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
