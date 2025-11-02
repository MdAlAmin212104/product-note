export default function AdditionalPage() {
    return (
        <s-page heading="New Note Added Action">
            <s-section heading="Note Added Form">
                <s-clickable paddingBlock="base">
                    <s-text-field placeholder="Selected your products" />
                </s-clickable>
                <s-heading>Note Title</s-heading>
                <s-text-field />
                <s-heading>Note Description</s-heading>
                <s-text-area maxLength={300} />
                <div style={{display: "flex", justifyContent: "end"}}>
                    <s-button-group>
                    <s-button slot="primary-action">Save</s-button>
                    <s-button slot="secondary-actions">Cancel</s-button>
                </s-button-group>
                </div>
            </s-section>
        </s-page>
    );
}
