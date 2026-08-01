export const MASTER_CONFIG = {
  payment_terms: {
    key: 'payment_terms',
    displayName: 'Payment Terms',
    singularName: 'Payment Term',
    nameField: 'name',
    fields: [
      { name: 'name', label: 'Payment Term Name', type: 'text', required: true, placeholder: 'e.g. LC At Sight, 30 Days' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, placeholder: 'Optional payment terms description' },
    ],
    tableColumns: [
      { header: 'Payment Term', accessor: 'name' },
      { header: 'Description', accessor: 'description' },
    ],
  },
  product_categories: {
    key: 'product_categories',
    displayName: 'Product Categories',
    singularName: 'Product Category',
    nameField: 'categoryName',
    fields: [
      { name: 'categoryName', label: 'Category Name', type: 'text', required: true, placeholder: 'e.g. Sanitary Ware, Tiles' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, placeholder: 'Category description' },
    ],
    tableColumns: [
      { header: 'Category Name', accessor: 'categoryName' },
      { header: 'Description', accessor: 'description' },
    ],
  },
  export_terms: {
    key: 'export_terms',
    displayName: 'Export Terms (Incoterms)',
    singularName: 'Export Term',
    nameField: 'term',
    fields: [
      { name: 'term', label: 'Export Term (Incoterm)', type: 'text', required: true, placeholder: 'e.g. FOB, CIF, EXW, CFR' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, placeholder: 'Incoterm description' },
    ],
    tableColumns: [
      { header: 'Export Term', accessor: 'term' },
      { header: 'Description', accessor: 'description' },
    ],
  },
  hsn_codes: {
    key: 'hsn_codes',
    displayName: 'HSN Codes',
    singularName: 'HSN Code',
    nameField: 'hsnCode',
    fields: [
      { name: 'hsnCode', label: 'HSN Code', type: 'text', required: true, placeholder: 'e.g. 10063020, 69101000' },
      { name: 'gstPercentage', label: 'GST Percentage (%)', type: 'number', required: true, placeholder: '18' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, placeholder: 'HSN Description' },
    ],
    tableColumns: [
      { header: 'HSN Code', accessor: 'hsnCode' },
      { header: 'GST %', accessor: 'gstPercentage' },
      { header: 'Description', accessor: 'description' },
    ],
  },
  container_quantities: {
    key: 'container_quantities',
    displayName: 'Container Quantities',
    singularName: 'Container Quantity',
    nameField: 'quantityName',
    fields: [
      { name: 'quantityName', label: 'Container Quantity / Type', type: 'text', required: true, placeholder: 'e.g. 1 x 20 FT, 2 x 40 HC' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, placeholder: 'Container specs' },
    ],
    tableColumns: [
      { header: 'Container Type', accessor: 'quantityName' },
      { header: 'Description', accessor: 'description' },
    ],
  },
  units: {
    key: 'units',
    displayName: 'Units Master',
    singularName: 'Unit',
    nameField: 'unitName',
    fields: [
      { name: 'unitName', label: 'Unit Name', type: 'text', required: true, placeholder: 'e.g. KGS, MTS, PCS, BOXES, SET' },
      { name: 'multiplier', label: 'Multiplier Factor (e.g. 2 for SET to double Qty)', type: 'number', required: true, placeholder: '1' },
      { name: 'description', label: 'Description', type: 'textarea', required: false, placeholder: 'Unit description' },
    ],
    tableColumns: [
      { header: 'Unit Name', accessor: 'unitName' },
      { header: 'Multiplier Factor', accessor: 'multiplier' },
      { header: 'Description', accessor: 'description' },
    ],
  },
};
