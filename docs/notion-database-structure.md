
# Notion Database Structure Design

## Database Properties

Create a database named "Blog Posts" containing the following properties:

### Required properties
- **Title** (Title) - The post title
- **Description** (Rich text) - A short description of the post
- **Content** (Rich text) - The post body (optional if using page content)
- **Status** (Select) - Status: Draft, Review, Published, Archived
- **Language** (Select) - Language: zh, en
- **Date** (Date) - Publish date
- **Last Modified** (Last edited time) - Last modified timestamp

### Categorization properties
- **Categories** (Multi-select) - Categories: technology, life, algorithm, tutorial
- **Tags** (Multi-select) - Tags: javascript, vue, leetcode, css
- **Series** (Select) - Series (optional)

### SEO properties
- **Summary** (Rich text) - Post summary
- **Keywords** (Multi-select) - SEO keywords
- **Featured** (Checkbox) - Whether the post is featured

### Technical properties
- **Reading Time** (Number) - Estimated reading time (minutes)
- **Word Count** (Number) - Word count
- **Hugo Path** (Rich text) - File path used in Hugo

## Database Templates

Create the following templates:

### 1. Technical article template
- Categories: technology
- Tags: javascript, tutorial
- Series: Technical Series

### 2. Algorithm solution template
- Categories: algorithm
- Tags: leetcode, javascript
- Series: LeetCode Solutions

### 3. Personal essay template
- Categories: life
- Tags: life, reflection

## Usage Recommendations

1. State management
   - Draft: Drafts that should not be synced
   - Review: Pending review; do not sync
   - Published: Published posts; will be synced to the blog
   - Archived: Archived posts; removed from the blog

2. Content organization
   - Store the main body in the page content rather than a single database property
   - Use various Notion block types inside the page for rich structure
   - Leverage Notion's collaboration features for editing and reviews

3. Bulk operations
   - Use database views to filter posts by status or other properties
   - Use Notion's bulk edit features for batch updates
