import { Test, TestingModule } from '@nestjs/testing';
import { MatchTeamsController } from './match_teams.controller';
import { MatchTeamsService } from './match_teams.service';

describe('MatchTeamsController', () => {
  let controller: MatchTeamsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchTeamsController],
      providers: [MatchTeamsService],
    }).compile();

    controller = module.get<MatchTeamsController>(MatchTeamsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
