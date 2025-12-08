import { Test, TestingModule } from '@nestjs/testing';
import { MatchTeamsService } from './match_teams.service';

describe('MatchTeamsService', () => {
  let service: MatchTeamsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchTeamsService],
    }).compile();

    service = module.get<MatchTeamsService>(MatchTeamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
