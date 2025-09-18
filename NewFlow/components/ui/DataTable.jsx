import React from 'react';
import UserAvatar from './UserAvatar';
import StatusBadge from './StatusBadge';
import Button from './Button';
import './DataTable.css';

const DataTable = ({ 
  columns, 
  data, 
  onAction,
  className = '',
  gridColumns = null, // Allow custom grid columns
  onRowClick = null
}) => {
  // Generate grid columns if not provided
  const defaultGridColumns = columns.map(() => '1fr').join(' ');
  const gridTemplateColumns = gridColumns || defaultGridColumns;

  const renderCellContent = (column, row, rowIndex) => {
    const value = row[column.key];
    
    switch (column.type) {
      case 'avatar':
        return (
          <UserAvatar 
            name={value.name || value} 
            email={value.email}
            size="medium"
            showName={true}
            showEmail={true}
          />
        );
      
      case 'status':
        return <StatusBadge status={value} />;
      
      case 'actions':
        return (
          <div className="action-buttons">
            {column.actions.map((action, index) => (
              <Button
                key={index}
                variant="default"
                size="small"
                onClick={() => onAction && onAction(row.id, action.key)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        );
      
      case 'badge':
        return (
          <span className={`${column.badgeClass || 'badge'}`}>
            {value}
          </span>
        );
      
      default:
        return value;
    }
  };

  return (
    <div 
      className={`newflow-data-table ${className}`}
      style={{ '--grid-columns': gridTemplateColumns }}
    >
      <div className="table-header">
        {columns.map((column, index) => (
          <div key={index} className="table-cell header-cell">
            {column.title}
          </div>
        ))}
      </div>
      
      {data.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No data available</h3>
          <p>There are no items to display at this time.</p>
        </div>
      ) : (
        data.map((row, rowIndex) => (
          <div 
            key={row.id || rowIndex} 
            className={`table-row ${onRowClick ? 'clickable' : ''}`}
            onClick={() => onRowClick && onRowClick(row, rowIndex)}
          >
            {columns.map((column, colIndex) => (
              <div key={colIndex} className="table-cell">
                {renderCellContent(column, row, rowIndex)}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default DataTable;
