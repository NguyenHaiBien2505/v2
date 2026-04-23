package nhb.vn.be.config;

import com.nimbusds.jose.JOSEException;
import lombok.extern.slf4j.Slf4j;
import nhb.vn.be.dto.request.IntrospectRequest;
import nhb.vn.be.service.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.text.ParseException;
import java.util.Objects;

@Component
@Slf4j
public class CustomJwtDecoder implements JwtDecoder {
    @Value("${jwt.signerKey}")
    private String signerKey;

    @Autowired
    private AuthenticationService authenticationService;

    private NimbusJwtDecoder nimbusJwtDecoder = null;

    @Override
    public Jwt decode(String token) throws JwtException {

        try {
            var response = authenticationService.introspect(
                    IntrospectRequest.builder().token(token).build());

            if (!response.isValid()) {
                log.warn("Introspect returned invalid for token (first 32 chars): {}..., valid=false", token == null ? "null" : token.substring(0, Math.min(32, token.length())));
                throw new JwtException("Token invalid (introspect=false)");
            }
            log.debug("Introspect validated token (first 32 chars): {}...", token == null ? "null" : token.substring(0, Math.min(32, token.length())));
        } catch (JOSEException | ParseException e) {
            log.error("Error during token introspection/verification: {}", e.getMessage(), e);
            throw new JwtException(e.getMessage());
        }

        if (Objects.isNull(nimbusJwtDecoder)) {
            SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS256");
            nimbusJwtDecoder = NimbusJwtDecoder.withSecretKey(secretKeySpec)
                    .macAlgorithm(MacAlgorithm.HS256)
                    .build();
        }

        return nimbusJwtDecoder.decode(token);
    }
}
