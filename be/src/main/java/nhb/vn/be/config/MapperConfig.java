package nhb.vn.be.config;

import org.mapstruct.factory.Mappers;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import nhb.vn.be.mapper.AppointmentMapper;

@Configuration
public class MapperConfig {

    @Bean
    public AppointmentMapper appointmentMapper() {
        return Mappers.getMapper(AppointmentMapper.class);
    }
}
