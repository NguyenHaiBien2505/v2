package nhb.vn.be.repository;

import nhb.vn.be.entity.InvalidateToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvalidateTokenRepository extends JpaRepository<InvalidateToken, String> {
}
