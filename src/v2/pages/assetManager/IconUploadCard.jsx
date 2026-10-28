import { ICON_GROUP_OPTIONS } from "./constants";

const IconUploadCard = ({
  uploadGroup,
  onChangeUploadGroup,
  onChangeFiles,
  onSubmit,
  isUploading,
}) => (
  <article className="v2-asset-manager-card">
    <header>
      <h2>Icon Upload</h2>
      <p>Drop icons into `src/assets/actions/*` through the local API.</p>
    </header>

    <form className="v2-asset-manager-form" onSubmit={onSubmit}>
      <label>
        Icon Group
        <select
          value={uploadGroup}
          onChange={(event) => onChangeUploadGroup(event.target.value)}
        >
          {ICON_GROUP_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Files
        <input
          type="file"
          accept=".webp,.png,.jpg,.jpeg"
          multiple
          onChange={(event) => {
            const nextFiles = event.target.files
              ? Array.from(event.target.files)
              : [];
            onChangeFiles(nextFiles);
          }}
        />
      </label>

      <button type="submit" disabled={isUploading}>
        {isUploading ? "Uploading..." : "Upload Icons"}
      </button>
    </form>
  </article>
);

export default IconUploadCard;
