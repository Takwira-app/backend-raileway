import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateStadiumDto } from './dto/create-stadium.dto';
import { UpdateStadiumDto } from './dto/update-stadium.dto';
import { UpdateStadiumStatusDto } from './dto/update-stadium-status.dto';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class StadiumsService {
  constructor(private prisma: PrismaService) {}
  
  async updatePhotos(stadiumId: number, photos: string[], ownerId: number) {
  // Verify ownership
  const stadium = await this.prisma.stadiums.findUnique({
    where: { stadium_id: stadiumId },
  });

  if (!stadium) {
    throw new NotFoundException('Stadium not found');
  }

  if (stadium.owner_id !== ownerId) {
    throw new ForbiddenException('You do not own this stadium');
  }

  // Update photos
  return this.prisma.stadiums.update({
    where: { stadium_id: stadiumId },
    data: { photos },
  });
}

  async create(dto: CreateStadiumDto,ownerId:number) {
    return this.prisma.stadiums.create({
      data:{
        ...dto,
        owner_id:ownerId,
      }
    })
  }

  async findAll(query: any) {
    return this.prisma.stadiums.findMany({
      where: {
        owner_id: query.owner_id ? Number(query.owner_id) : undefined,
        status: query.status || undefined,
      },
      include: { users: true, matches: true },
    });
  }

  async findOne(id: number) {
    const stadium = await this.prisma.stadiums.findUnique({
      where: { stadium_id: id },
      include: { users: true, matches: true },
    });

    if (!stadium) throw new NotFoundException('Stadium not found');
    return stadium;
  }

  async getMyStadiums(ownerId: number) {
    return this.prisma.stadiums.findMany({
      where: { owner_id: ownerId },
      include: { matches: true },
    });
  }

  async getAvailability(stadium_id: number) {
    const matches = await this.prisma.matches.findMany({
      where: { stadium_id },
      select: { match_date: true, start_time: true, status: true },
    });

    return { stadium_id, booked_slots: matches };
  }


  async update(id: number, dto: UpdateStadiumDto, ownerId: number) {
    const stadium = await this.prisma.stadiums.findUnique({
      where: { stadium_id: id },
    });

    if (!stadium) throw new NotFoundException('Stadium not found');
    if (stadium.owner_id !== ownerId)
      throw new ForbiddenException('Not allowed');

    return this.prisma.stadiums.update({
      where: { stadium_id: id },
      data: dto,
    });
  }

  async updateStatus(id: number, dto: UpdateStadiumStatusDto, ownerId: number) {
    const stadium = await this.prisma.stadiums.findUnique({
      where: { stadium_id: id },
    });

    if (!stadium) throw new NotFoundException('Stadium not found');
    if (stadium.owner_id !== ownerId)
      throw new ForbiddenException('Not allowed');

    return this.prisma.stadiums.update({
      where: { stadium_id: id },
      data: { status: dto.status },
    });
  }


  async remove(id: number, ownerId: number) {
    const stadium = await this.prisma.stadiums.findUnique({
      where: { stadium_id: id },
    });

    if (!stadium) throw new NotFoundException('Stadium not found');
    if (stadium.owner_id !== ownerId)
      throw new ForbiddenException('Not allowed');

    return this.prisma.stadiums.delete({
      where: { stadium_id: id },
    });
  }
}
