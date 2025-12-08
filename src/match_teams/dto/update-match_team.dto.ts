import { PartialType } from '@nestjs/mapped-types';
import { CreateMatchTeamDto } from './create-match_team.dto';

export class UpdateMatchTeamDto extends PartialType(CreateMatchTeamDto) {}
