import { Test, TestingModule } from '@nestjs/testing'
import { DeletePrivateExercisesHandler } from './delete-private-exercises.handler'
import { DeletePrivateExercisesCommand } from './delete-private-exercises.command'

describe('DeletePrivateExercisesHandler', () => {
  let handler: DeletePrivateExercisesHandler
  let prisma: { privateExercise: { findMany: jest.Mock; deleteMany: jest.Mock } }

  beforeEach(async () => {
    prisma = { privateExercise: { findMany: jest.fn(), deleteMany: jest.fn() } }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeletePrivateExercisesHandler,
        { provide: 'PrismaService', useValue: prisma },
      ],
    }).compile()

    handler = module.get(DeletePrivateExercisesHandler)
  })

  it('short-circuits on empty list', async () => {
    const result = await handler.execute(
      new DeletePrivateExercisesCommand([], 'user-1'),
    )
    expect(result).toEqual({ deleted: 0 })
    expect(prisma.privateExercise.findMany).not.toHaveBeenCalled()
    expect(prisma.privateExercise.deleteMany).not.toHaveBeenCalled()
  })

  it('deletes owned exercises', async () => {
    prisma.privateExercise.findMany.mockResolvedValue([
      { id: 'a' },
      { id: 'b' },
      { id: 'c' },
    ])
    prisma.privateExercise.deleteMany.mockResolvedValue({ count: 3 })

    const result = await handler.execute(
      new DeletePrivateExercisesCommand(['a', 'b', 'c'], 'user-1'),
    )

    expect(result).toEqual({ deleted: 3 })
    expect(prisma.privateExercise.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['a', 'b', 'c'] }, userId: 'user-1' },
      select: { id: true },
    })
    expect(prisma.privateExercise.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['a', 'b', 'c'] }, userId: 'user-1' },
    })
  })

  it('filters to owned IDs only', async () => {
    // Submitted 5 IDs, but only 2 belong to this user
    prisma.privateExercise.findMany.mockResolvedValue([{ id: 'b' }, { id: 'd' }])
    prisma.privateExercise.deleteMany.mockResolvedValue({ count: 2 })

    const result = await handler.execute(
      new DeletePrivateExercisesCommand(['a', 'b', 'c', 'd', 'e'], 'user-1'),
    )

    expect(result).toEqual({ deleted: 2 })
    expect(prisma.privateExercise.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['b', 'd'] }, userId: 'user-1' },
    })
  })

  it('propagates prisma errors', async () => {
    prisma.privateExercise.findMany.mockRejectedValue(new Error('DB error'))

    await expect(
      handler.execute(new DeletePrivateExercisesCommand(['a'], 'user-1')),
    ).rejects.toThrow('DB error')
  })
})