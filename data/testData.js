function uniqueEmail(prefix = 'qa') {
  return `${prefix}.${Date.now()}.${Math.random().toString(16).slice(2, 8)}@example.com`;
}

function validUser(overrides = {}) {
  return {
    email: uniqueEmail('user'),
    password: 'supersecret',
    ...overrides
  };
}

function validPost(overrides = {}) {
  return {
    title: 'Launch campaign',
    content: 'Schedule this post for the next content slot.',
    platform: 'facebook',
    ...overrides
  };
}

module.exports = {
  uniqueEmail,
  validUser,
  validPost
};
