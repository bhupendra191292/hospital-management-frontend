// Modal Comprehensive Test
// This test verifies that modals have fixed headers and footers

const modalTests = {
  // Test 1: Check if modal content has proper flex structure
  testModalStructure: () => {
    const modalContent = document.querySelector('.modal-content');
    const modalContainer = document.querySelector('.modal-content-container');
    
    if (!modalContent || !modalContainer) {
      return { passed: false, message: 'Modal structure not found' };
    }
    
    const modalContentStyles = window.getComputedStyle(modalContent);
    const containerStyles = window.getComputedStyle(modalContainer);
    
    const hasFlexColumn = modalContentStyles.display === 'flex' && 
                         modalContentStyles.flexDirection === 'column';
    const hasOverflowHidden = modalContentStyles.overflow === 'hidden';
    const containerHasFlex = containerStyles.display === 'flex' && 
                            containerStyles.flexDirection === 'column';
    
    return {
      passed: hasFlexColumn && hasOverflowHidden && containerHasFlex,
      message: `Modal structure: flex=${hasFlexColumn}, overflow=${hasOverflowHidden}, container=${containerHasFlex}`
    };
  },
  
  // Test 2: Check if header is fixed (flex-shrink: 0)
  testHeaderFixed: () => {
    const header = document.querySelector('.modal-header');
    if (!header) {
      return { passed: false, message: 'Modal header not found' };
    }
    
    const styles = window.getComputedStyle(header);
    const flexShrink = styles.flexShrink;
    const position = styles.position;
    
    return {
      passed: flexShrink === '0',
      message: `Header flex-shrink: ${flexShrink}, position: ${position}`
    };
  },
  
  // Test 3: Check if footer is fixed (flex-shrink: 0)
  testFooterFixed: () => {
    const footer = document.querySelector('.modal-footer');
    if (!footer) {
      return { passed: false, message: 'Modal footer not found' };
    }
    
    const styles = window.getComputedStyle(footer);
    const flexShrink = styles.flexShrink;
    
    return {
      passed: flexShrink === '0',
      message: `Footer flex-shrink: ${flexShrink}`
    };
  },
  
  // Test 4: Check if body is scrollable (flex: 1, overflow-y: auto)
  testBodyScrollable: () => {
    const body = document.querySelector('.modal-body');
    if (!body) {
      return { passed: false, message: 'Modal body not found' };
    }
    
    const styles = window.getComputedStyle(body);
    const flex = styles.flex;
    const overflowY = styles.overflowY;
    
    return {
      passed: flex === '1' && overflowY === 'auto',
      message: `Body flex: ${flex}, overflow-y: ${overflowY}`
    };
  },
  
  // Test 5: Check if header takes full width
  testHeaderFullWidth: () => {
    const header = document.querySelector('.modal-header');
    const container = document.querySelector('.modal-content-container');
    
    if (!header || !container) {
      return { passed: false, message: 'Header or container not found' };
    }
    
    const headerRect = header.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    const widthMatch = Math.abs(headerRect.width - containerRect.width) < 5;
    
    return {
      passed: widthMatch,
      message: `Header width: ${headerRect.width}px, Container width: ${containerRect.width}px`
    };
  },
  
  // Test 6: Check if footer takes full width
  testFooterFullWidth: () => {
    const footer = document.querySelector('.modal-footer');
    const container = document.querySelector('.modal-content-container');
    
    if (!footer || !container) {
      return { passed: false, message: 'Footer or container not found' };
    }
    
    const footerRect = footer.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    const widthMatch = Math.abs(footerRect.width - containerRect.width) < 5;
    
    return {
      passed: widthMatch,
      message: `Footer width: ${footerRect.width}px, Container width: ${containerRect.width}px`
    };
  },
  
  // Test 7: Check if header has no background color
  testHeaderNoBackground: () => {
    const header = document.querySelector('.modal-header');
    if (!header) {
      return { passed: false, message: 'Modal header not found' };
    }
    
    const styles = window.getComputedStyle(header);
    const backgroundColor = styles.backgroundColor;
    
    // Check if background is transparent or matches parent
    const isTransparent = backgroundColor === 'rgba(0, 0, 0, 0)' || 
                         backgroundColor === 'transparent';
    
    return {
      passed: isTransparent,
      message: `Header background: ${backgroundColor}`
    };
  }
};

// Run all tests
function runModalTests() {
  console.log('🧪 Running Modal Tests...');
  
  const results = {};
  let allPassed = true;
  
  for (const [testName, testFn] of Object.entries(modalTests)) {
    try {
      const result = testFn();
      results[testName] = result;
      if (!result.passed) {
        allPassed = false;
      }
      console.log(`${result.passed ? '✅' : '❌'} ${testName}: ${result.message}`);
    } catch (error) {
      results[testName] = { passed: false, message: `Error: ${error.message}` };
      allPassed = false;
      console.log(`❌ ${testName}: Error - ${error.message}`);
    }
  }
  
  console.log(`\n🎯 Overall Result: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
  
  return { allPassed, results };
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.runModalTests = runModalTests;
  window.modalTests = modalTests;
}

// Auto-run if in browser
if (typeof window !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(runModalTests, 1000);
  });
} else if (typeof window !== 'undefined') {
  setTimeout(runModalTests, 1000);
}
