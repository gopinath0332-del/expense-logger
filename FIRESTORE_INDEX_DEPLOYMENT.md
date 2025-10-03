# Firestore Index Deployment Guide

## Overview

This application uses a Firestore composite index to enable efficient server-side date range queries. The index configuration is defined in `firestore.indexes.json`.

## What is the Index For?

The composite index allows Firestore to efficiently execute queries with:
- Multiple `where` clauses on the `date` field (`>=` and `<=`)
- Combined with `orderBy` on the same field

Without this index, the application would either:
1. Fail with a "missing index" error, OR
2. Fall back to fetching all data and filtering client-side (inefficient)

## Prerequisites

Before deploying the index, ensure you have:

1. **Firebase CLI installed**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase project initialized**:
   ```bash
   firebase login
   firebase init firestore
   ```

3. **Firestore database created** in your Firebase project

## Deployment Steps

### Option 1: Firebase CLI (Recommended)

1. **Navigate to the project directory**:
   ```bash
   cd /path/to/expense-logger
   ```

2. **Deploy the indexes**:
   ```bash
   firebase deploy --only firestore:indexes
   ```

3. **Wait for index creation**:
   - Simple indexes: Usually ready in seconds
   - Complex indexes: May take several minutes
   - Check status in Firebase Console

### Option 2: Firebase Console (Manual)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Indexes**
4. Click **Add Index**
5. Configure the index:
   - **Collection ID**: `transactions`
   - **Fields to index**:
     - Field: `date`, Order: `Descending`
   - **Query scope**: `Collection`
6. Click **Create**

### Option 3: Automatic Index Creation

When you run a query that requires an index, Firestore will:
1. Throw an error with a link to create the index
2. You can click that link to auto-create the index
3. Wait for the index to build (usually a few minutes)

Example error message:
```
The query requires an index. You can create it here: https://console.firebase.google.com/...
```

## Verifying the Index

### Check Index Status in Console

1. Go to Firebase Console → Firestore Database → Indexes
2. Look for the `transactions` collection index
3. Status should be "Enabled" (green)

### Test the Query

Run the application and navigate between months:

```bash
npm run dev
```

Check the browser console for:
- ✅ Success: "Loaded transactions from Firebase for 2025-1"
- ❌ Error: "The query requires an index..."

### Using Firebase CLI

Check index status:
```bash
firebase firestore:indexes
```

## Index Configuration Details

The `firestore.indexes.json` file contains:

```json
{
  "indexes": [
    {
      "collectionGroup": "transactions",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "date",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

**What each field means**:
- `collectionGroup`: The collection name (`transactions`)
- `queryScope`: `COLLECTION` (indexes within a single collection)
- `fields`: Array of fields to index
  - `fieldPath`: The field name (`date`)
  - `order`: Sort order (`DESCENDING`)

## Troubleshooting

### Index Creation Fails

**Problem**: Error during `firebase deploy --only firestore:indexes`

**Solutions**:
1. Check Firebase CLI is logged in: `firebase login`
2. Verify project ID: `firebase use --list`
3. Ensure Firestore is enabled in Firebase Console
4. Check you have proper permissions (Editor or Owner role)

### Index Building Takes Too Long

**Problem**: Index status shows "Building" for over 30 minutes

**Solutions**:
1. Check Firebase Console for error messages
2. Try deleting and recreating the index
3. Contact Firebase Support if issue persists

### Query Still Fails After Index Creation

**Problem**: Application still shows "missing index" error

**Solutions**:
1. Wait a few more minutes (index may still be building)
2. Clear browser cache and reload
3. Check the index field configuration matches the query
4. Verify the index status is "Enabled" in Firebase Console

### Multiple Index Errors

**Problem**: Getting multiple "missing index" errors for different queries

**Solution**: 
Each unique combination of `where` and `orderBy` clauses requires its own index. If you add more complex queries later, you'll need to create additional indexes.

## Performance Impact

### Before Index
- Query fetches all documents
- Filters client-side
- Time: 500ms - 2s (depending on data size)
- Data transfer: Entire collection

### After Index
- Query fetches only matching documents
- Filters server-side
- Time: 100ms - 300ms
- Data transfer: Only current month

### Example Metrics
For 1000 transactions spanning 12 months:

| Metric | Without Index | With Index | Improvement |
|--------|--------------|------------|-------------|
| Query Time | 1500ms | 200ms | 7.5x faster |
| Data Transfer | 500KB | 40KB | 12.5x less |
| Firebase Reads | 1000 docs | 80 docs | 12.5x less |

## Maintenance

### When to Update

Update the index when:
1. Adding new date range queries
2. Adding fields to existing queries
3. Changing sort order requirements

### How to Update

1. Modify `firestore.indexes.json`
2. Deploy changes: `firebase deploy --only firestore:indexes`
3. Wait for index to build
4. Test the application

### Deleting Old Indexes

If you remove a query from your code:
1. The old index is safe to delete (saves storage)
2. Go to Firebase Console → Indexes
3. Click the trash icon next to unused indexes

## Best Practices

1. **Deploy indexes before queries**: Always deploy indexes before releasing code that needs them
2. **Test locally first**: Use Firestore emulator for local testing
3. **Monitor index usage**: Check Firebase Console for index performance
4. **Keep indexes minimal**: Only create indexes you actually need
5. **Version control**: Always commit `firestore.indexes.json` to Git

## Resources

- [Firestore Indexes Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Query Optimization Guide](https://firebase.google.com/docs/firestore/query-data/query-optimization)

## Support

If you encounter issues:
1. Check the [Firebase Status Dashboard](https://status.firebase.google.com/)
2. Review [Firebase Support](https://firebase.google.com/support)
3. Post in [Stack Overflow](https://stackoverflow.com/questions/tagged/google-cloud-firestore) with tag `google-cloud-firestore`
