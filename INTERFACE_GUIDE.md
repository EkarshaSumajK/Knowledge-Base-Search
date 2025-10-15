# Interface Guide

## Layout Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Knowledge Base Search              [Theme Toggle]          │
│  RAG-powered document search with AI synthesis              │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  📤 Upload Documents to Knowledge Base                      │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Click to upload or drag and drop                     │ │
│  │  PDF, TXT, or DOCX files                              │ │
│  └───────────────────────────────────────────────────────┘ │
│  [Selected files list]                                      │
│  [Upload button]                                            │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  Chat Messages Area                                          │
│  - User messages                                             │
│  - AI responses with citations                               │
│  - Source documents                                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  [📎] Ask a question about your documents...                │
│  [Model: GPT 4o ▼]                                    [Send]│
└─────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Header
- **Title**: Knowledge Base Search
- **Subtitle**: RAG-powered document search with AI synthesis
- **Theme Toggle**: Switch between light/dark mode

### 2. Upload Section (Always Visible)
- **Location**: Top of page, below header
- **Features**:
  - Drag-and-drop zone
  - File type indicator (PDF, TXT, DOCX)
  - Selected files list with remove option
  - Upload button
  - Success/error messages
- **Styling**: Subtle background to distinguish from chat area

### 3. Chat Area
- **Empty State**: 
  - Welcome message
  - Instructions for using the system
  - Visual icon
- **With Messages**:
  - User messages (right-aligned)
  - AI responses (left-aligned)
  - Source citations (collapsible)
  - Message actions (copy, regenerate)

### 4. Input Area
- **Attachment Button**: Click to add files inline
- **Text Input**: Multi-line textarea
- **Model Selector**: Dropdown to choose AI model
- **Send Button**: Submit query

## User Flows

### Flow 1: Bulk Document Upload
```
1. User lands on page
2. Sees upload section immediately
3. Drags files or clicks to select
4. Reviews selected files
5. Clicks "Upload X file(s)"
6. Sees success message
7. Files are indexed in knowledge base
```

### Flow 2: Inline Document Upload
```
1. User clicks attachment icon in chat
2. Selects files
3. Files appear as attachments in input
4. User types question
5. Clicks send
6. Files are uploaded to knowledge base
7. Question is answered using RAG
```

### Flow 3: Asking Questions
```
1. User types question in input
2. Optionally selects different model
3. Clicks send or presses Enter
4. AI searches knowledge base
5. Relevant documents retrieved
6. Answer synthesized with citations
7. Response streams in real-time
```

## Visual States

### Upload Section States

**Empty State:**
```
┌─────────────────────────────────────┐
│  📤 Upload Documents                │
│  ┌───────────────────────────────┐ │
│  │  ⬆️  Click to upload          │ │
│  │     or drag and drop          │ │
│  │  PDF, TXT, or DOCX files      │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

**With Files Selected:**
```
┌─────────────────────────────────────┐
│  📤 Upload Documents                │
│  📄 document1.pdf (2.3 MB)      [×] │
│  📄 notes.txt (45 KB)           [×] │
│  [Upload 2 file(s)]                 │
└─────────────────────────────────────┘
```

**Uploading:**
```
┌─────────────────────────────────────┐
│  📤 Upload Documents                │
│  [Uploading...]                     │
└─────────────────────────────────────┘
```

**Success:**
```
┌─────────────────────────────────────┐
│  📤 Upload Documents                │
│  ✅ Documents uploaded successfully!│
└─────────────────────────────────────┘
```

### Chat States

**Empty (No Messages):**
```
┌─────────────────────────────────────┐
│                                     │
│         🔵                          │
│         ⬆️                          │
│                                     │
│  Ready to Search Your Knowledge Base│
│                                     │
│  Upload documents above or attach   │
│  them directly in the chat.         │
│                                     │
└─────────────────────────────────────┘
```

**With Messages:**
```
┌─────────────────────────────────────┐
│  User: What is RAG?                 │
│                                     │
│  AI: RAG (Retrieval-Augmented      │
│  Generation) is...                  │
│  [Sources: 2 documents]             │
│  [Copy] [Retry]                     │
└─────────────────────────────────────┘
```

**Loading:**
```
┌─────────────────────────────────────┐
│  User: Explain the architecture     │
│                                     │
│  ⏳ Searching knowledge base...     │
└─────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (> 1024px)
- Full width layout (max 1024px centered)
- Upload section: Full width
- Chat: Comfortable spacing
- Input: Full toolbar visible

### Tablet (768px - 1024px)
- Slightly narrower margins
- Upload section: Full width
- Chat: Adjusted spacing
- Input: Compact toolbar

### Mobile (< 768px)
- Stack layout
- Upload section: Full width, touch-friendly
- Chat: Full width messages
- Input: Simplified toolbar, icons only

## Accessibility

### Keyboard Navigation
- Tab through all interactive elements
- Enter to submit forms
- Escape to close dropdowns
- Arrow keys in model selector

### Screen Readers
- Proper ARIA labels
- Semantic HTML structure
- Status announcements for uploads
- Message role indicators

### Visual
- High contrast mode support
- Focus indicators
- Large touch targets (44px minimum)
- Clear visual hierarchy

## Theme Support

### Light Mode
- White background
- Gray borders
- Blue accents
- Dark text

### Dark Mode
- Dark gray background
- Subtle borders
- Blue accents (adjusted)
- Light text

### System Preference
- Automatically detects OS theme
- Respects user preference
- Smooth transitions

## Best Practices

### For Users
1. Upload documents before asking questions
2. Use descriptive filenames
3. Upload related documents together
4. Try different models for different tasks
5. Use inline attachments for quick additions

### For Developers
1. Keep upload section always visible
2. Provide clear feedback on all actions
3. Handle errors gracefully
4. Optimize for mobile
5. Test with various file sizes
