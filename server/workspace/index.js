const express = require('express');
const {
  getWorkspaces,
  getWorkspace,
  addWorkspace,
  editWorkspace,
  removeWorkspace
} = require('./controller');

const router = express.Router();

router.get('/', getWorkspaces);
router.get('/:id', getWorkspace);
router.post('/', addWorkspace);
router.put('/:id', editWorkspace);
router.delete('/:id', removeWorkspace);

module.exports = router;
