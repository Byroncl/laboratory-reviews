describe('Posts Feature', () => {
  beforeEach(() => {
    cy.visit('/posts');
    cy.wait(1000);
  });

  it('should load and display posts list', () => {
    cy.get('[data-cy=post-card]').should('exist');
    cy.get('[data-cy=post-title]').should('have.length.greaterThan', 0);
  });

  it('should search posts by title', () => {
    cy.get('[data-cy=search-input]').type('Angular');
    cy.get('[data-cy=post-card]').should('contain', 'Angular');
  });

  it('should navigate to post detail', () => {
    cy.get('[data-cy=view-button]').first().click();
    cy.url().should('include', '/posts/');
    cy.get('[data-cy=post-title]').should('exist');
  });

  it('should create a new post', () => {
    cy.get('[data-cy=new-post-button]').click();
    cy.url().should('include', '/posts/create');

    cy.get('[data-cy=title-input]').type('Test Post');
    cy.get('[data-cy=content-input]').type('This is a test post content');
    cy.get('[data-cy=author-input]').type('Test Author');

    cy.get('[data-cy=submit-button]').click();
    cy.url().should('include', '/posts');
  });

  it('should paginate through posts', () => {
    cy.get('[data-cy=next-button]').should('exist');
    cy.get('[data-cy=next-button]').click();
    cy.get('[data-cy=current-page]').should('contain', '2');
  });

  it('should filter by author', () => {
    cy.get('[data-cy=author-filter]').type('Alice');
    cy.get('[data-cy=post-card]').each(card => {
      cy.wrap(card).should('contain', 'Alice');
    });
  });

  it('should delete a post', () => {
    cy.get('[data-cy=post-card]').its('length').then(initialCount => {
      cy.get('[data-cy=delete-button]').first().click();
      cy.on('window:confirm', () => true);
      cy.get('[data-cy=post-card]').should('have.length.lessThan', initialCount);
    });
  });
});

describe('Comments Feature', () => {
  beforeEach(() => {
    cy.visit('/posts');
    cy.wait(500);
    cy.get('[data-cy=view-button]').first().click();
    cy.wait(1000);
  });

  it('should display comments', () => {
    cy.get('[data-cy=comment-item]').should('exist');
  });

  it('should create a comment', () => {
    cy.get('[data-cy=comment-textarea]').type('Great post!');
    cy.get('[data-cy=post-comment-button]').click();
    cy.get('[data-cy=comment-item]').should('contain', 'Great post!');
  });

  it('should reply to a comment', () => {
    cy.get('[data-cy=reply-button]').first().click();
    cy.get('[data-cy=reply-textarea]').type('I agree!');
    cy.get('[data-cy=post-reply-button]').click();
    cy.get('[data-cy=reply-item]').should('contain', 'I agree!');
  });
});
