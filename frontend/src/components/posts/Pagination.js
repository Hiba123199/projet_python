import React from 'react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Fonction pour générer les numéros de page à afficher
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Toujours afficher la première page
    pageNumbers.push(1);
    
    // Pages autour de la page actuelle
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pageNumbers.push(i);
    }
    
    // Toujours afficher la dernière page si elle existe
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    // Ajouter des ellipses si nécessaire
    return pageNumbers.reduce((acc, page, index, array) => {
      if (index > 0 && page - array[index - 1] > 1) {
        acc.push('...');
      }
      acc.push(page);
      return acc;
    }, []);
  };

  return (
    <nav aria-label="Pagination" className="my-4">
      <ul className="pagination justify-content-center">
        {/* Bouton "Précédent" */}
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &laquo; Précédent
          </button>
        </li>
        
        {/* Numéros de page */}
        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <li key={`ellipsis-${index}`} className="page-item disabled">
              <span className="page-link">...</span>
            </li>
          ) : (
            <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            </li>
          )
        ))}
        
        {/* Bouton "Suivant" */}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button 
            className="page-link" 
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Suivant &raquo;
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
