import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async getMyAddresses(userId: number) {
    return this.addressRepository.find({
      where: { user_id: userId },
      order: { is_default: 'DESC', id: 'DESC' },
    });
  }

  async createMyAddress(userId: number, dto: CreateAddressDto) {
    if (dto.is_default) {
      await this.clearDefaultAddress(userId);
    }

    const hasAnyAddress = await this.addressRepository.exists({
      where: { user_id: userId },
    });

    const address = this.addressRepository.create({
      ...dto,
      user_id: userId,
      full_name: dto.full_name.trim(),
      phone: dto.phone.trim(),
      address_line: dto.address_line.trim(),
      city: dto.city.trim(),
      district: dto.district.trim(),
      ward: dto.ward.trim(),
      address_type: dto.address_type?.trim().toLowerCase() || 'home',
      state: dto.state?.trim(),
      postal_code: dto.postal_code?.trim(),
      country: dto.country?.trim() || 'VN',
      is_default: dto.is_default ?? !hasAnyAddress,
    });

    return this.addressRepository.save(address);
  }

  async updateMyAddress(userId: number, addressId: number, dto: UpdateAddressDto) {
    const address = await this.findMyAddress(userId, addressId);

    if (dto.is_default) {
      await this.clearDefaultAddress(userId);
    }

    if (dto.full_name !== undefined) {
      address.full_name = dto.full_name.trim();
    }

    if (dto.phone !== undefined) {
      address.phone = dto.phone.trim();
    }

    if (dto.address_line !== undefined) {
      address.address_line = dto.address_line.trim();
    }

    if (dto.city !== undefined) {
      address.city = dto.city.trim();
    }

    if (dto.district !== undefined) {
      address.district = dto.district.trim();
    }

    if (dto.ward !== undefined) {
      address.ward = dto.ward.trim();
    }

    if (dto.address_type !== undefined) {
      address.address_type = dto.address_type.trim().toLowerCase();
    }

    if (dto.state !== undefined) {
      address.state = dto.state?.trim();
    }

    if (dto.postal_code !== undefined) {
      address.postal_code = dto.postal_code?.trim();
    }

    if (dto.country !== undefined) {
      address.country = dto.country?.trim();
    }

    if (dto.is_default !== undefined) {
      address.is_default = dto.is_default;
    }

    return this.addressRepository.save(address);
  }

  async setDefaultMyAddress(userId: number, addressId: number) {
    const address = await this.findMyAddress(userId, addressId);
    await this.clearDefaultAddress(userId);
    address.is_default = true;
    return this.addressRepository.save(address);
  }

  async removeMyAddress(userId: number, addressId: number) {
    const address = await this.findMyAddress(userId, addressId);
    await this.addressRepository.remove(address);

    if (address.is_default) {
      const latestAddress = await this.addressRepository.findOne({
        where: { user_id: userId },
        order: { id: 'DESC' },
      });

      if (latestAddress) {
        latestAddress.is_default = true;
        await this.addressRepository.save(latestAddress);
      }
    }

    return { message: `Address ${addressId} deleted` };
  }

  private async findMyAddress(userId: number, addressId: number): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, user_id: userId },
    });

    if (!address) {
      throw new NotFoundException(`Address with id ${addressId} not found`);
    }

    return address;
  }

  private async clearDefaultAddress(userId: number): Promise<void> {
    await this.addressRepository
      .createQueryBuilder()
      .update(Address)
      .set({ is_default: false })
      .where('user_id = :userId', { userId })
      .execute();
  }
}