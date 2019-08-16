module.exports = (db, DataLoader) => ({
  categories: new DataLoader(ids =>
    db
      .select()
      .from('category')
      .whereIn('department_id', ids)
      .then(categories =>
        ids.map(id =>
          categories.filter(category => category.department_id === id),
        ),
      ),
  ),
})
