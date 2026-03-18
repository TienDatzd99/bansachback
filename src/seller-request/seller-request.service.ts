import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SellerRequest } from './entities/seller-request.entity';
import { CreateSellerRequestDto } from './dto/create-seller-request.dto';
import { Shop } from '../shop/entities/shop.entity';

@Injectable()
export class SellerRequestService {
  constructor(
    @InjectRepository(SellerRequest)
    private readonly sellerRequestRepository: Repository<SellerRequest>,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
  ) {}

  async getMyStatus(userId: number) {
    const latestRequest = await this.sellerRequestRepository.findOne({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });

    if (!latestRequest) {
      return {
        hasRequest: false,
        status: null,
        requestId: null,
      };
    }

    return {
      hasRequest: true,
      status: latestRequest.status,
      requestId: latestRequest.id,
      reject_reason: latestRequest.reject_reason ?? null,
    };
  }

  async createRequest(userId: number, dto: CreateSellerRequestDto) {
    const existingActiveRequest = await this.sellerRequestRepository.findOne({
      where: {
        user_id: userId,
        status: In(['pending', 'approved']),
      },
      order: { created_at: 'DESC' },
    });

    if (existingActiveRequest) {
      throw new ConflictException(
        `You already have a ${existingActiveRequest.status} seller request`,
      );
    }

    const usernameTaken = await this.sellerRequestRepository.findOne({
      where: { username: dto.username.trim() },
    });
    if (usernameTaken) {
      throw new ConflictException('Username is already used by another store');
    }

    const shopNameTaken = await this.sellerRequestRepository.findOne({
      where: { shop_name: dto.shop_name.trim() },
    });
    if (shopNameTaken) {
      throw new ConflictException('Shop name is already used by another store');
    }

    const sellerRequest = this.sellerRequestRepository.create({
      user_id: userId,
      logo_url: dto.logo_url?.trim(),
      username: dto.username.trim(),
      shop_name: dto.shop_name.trim(),
      description: dto.description?.trim(),
      contact_email: dto.contact_email.toLowerCase().trim(),
      contact_phone: dto.contact_phone.trim(),
      address: dto.address.trim(),
      status: 'pending',
    });

    return this.sellerRequestRepository.save(sellerRequest);
  }

  async getAdminList(status?: 'pending' | 'approved' | 'rejected') {
    if (status) {
      return this.sellerRequestRepository.find({
        where: { status },
        order: { created_at: 'DESC' },
      });
    }

    return this.sellerRequestRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async getAdminDetail(id: number) {
    const sellerRequest = await this.sellerRequestRepository.findOne({
      where: { id },
    });

    if (!sellerRequest) {
      throw new NotFoundException('Seller request not found');
    }

    return sellerRequest;
  }

  async approveRequest(id: number) {
    const sellerRequest = await this.sellerRequestRepository.findOne({
      where: { id },
    });

    if (!sellerRequest) {
      throw new NotFoundException('Seller request not found');
    }

    sellerRequest.status = 'approved';
    sellerRequest.reject_reason = undefined;
    await this.sellerRequestRepository.save(sellerRequest);

    // Tự động tạo shop nếu chưa có
    const existingShop = await this.shopRepository.findOne({
      where: { user_id: sellerRequest.user_id },
    });
    if (!existingShop) {
      const shop = this.shopRepository.create({
        user_id: sellerRequest.user_id,
        shop_name: sellerRequest.shop_name,
        description: sellerRequest.description ?? undefined,
        logo_url: sellerRequest.logo_url ?? undefined,
      });
      await this.shopRepository.save(shop);
    }

    return sellerRequest;
  }

  async rejectRequest(id: number, reason: string) {
    const sellerRequest = await this.sellerRequestRepository.findOne({
      where: { id },
    });

    if (!sellerRequest) {
      throw new NotFoundException('Seller request not found');
    }

    sellerRequest.status = 'rejected';
    sellerRequest.reject_reason = reason.trim();
    return this.sellerRequestRepository.save(sellerRequest);
  }
}