import express from 'express';
import BranchController from '../../../controllers/chit/admin/client/branchController.js';
import BranchRepository from '../../../../infrastructure/repositories/chit/brachRepository.js';
import BranchUsecase from '../../../../usecases/auth/chit/client/brachUseCase.js';
import Validator from '../../../../utils/validations/validation.js';

const router = express.Router();

const branchRepository = new BranchRepository();
const branchUsecase = new BranchUsecase(branchRepository);
const validator = new Validator();
const branchController = new BranchController(branchUsecase, validator);

router.post('/table', (req, res) => branchController.branchTable(req, res));
router.get('/:id', (req, res) => branchController.getBranchById(req, res));
router.get('/client/:id', (req, res) => branchController.getBranchByClientId(req, res));
router.post('/', (req, res) => branchController.addBranch(req, res));
router.patch('/:id', (req, res) => branchController.updateBranch(req, res));
router.patch('/:id/active', (req, res) => branchController.changeStatus(req, res));
router.delete('/:id', (req, res) => branchController.deleteBranch(req, res));
router.get('/',(req,res)=>branchController.getAllBranch(req,res));

export default router;