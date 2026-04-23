package nhb.vn.be.controller;

import com.nimbusds.jose.JOSEException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import nhb.vn.be.dto.request.AuthenticationRequest;
import nhb.vn.be.dto.request.IntrospectRequest;
import nhb.vn.be.dto.request.LogoutRequest;
import nhb.vn.be.dto.request.RefreshRequest;
import nhb.vn.be.dto.response.APIResponse;
import nhb.vn.be.dto.response.AuthenticationResponse;
import nhb.vn.be.dto.response.IntrospectResponse;
import nhb.vn.be.service.AuthenticationService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import java.text.ParseException;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {

    AuthenticationService authenticationService;

    @PostMapping("/token-login")
    APIResponse<AuthenticationResponse> login(@RequestBody AuthenticationRequest request) {
        var result = authenticationService.authenticate(request);
        return APIResponse.<AuthenticationResponse>builder()
                .result(result)
                .build();
    }

    @PostMapping("/introspect")
    APIResponse<IntrospectResponse> login(@RequestBody IntrospectRequest request) throws ParseException, JOSEException {
        var result = authenticationService.introspect(request);
        return APIResponse.<IntrospectResponse>builder()
                .result(result)
                .build();
    }

    @PostMapping("/logout")
    APIResponse<Void> logout(@RequestBody LogoutRequest request) throws ParseException, JOSEException {
        authenticationService.logOut(request);
        return APIResponse.<Void>builder()
                .build();
    }

    @PostMapping("/refresh")
    APIResponse<AuthenticationResponse> refresh(@RequestBody RefreshRequest request) throws ParseException, JOSEException {
        var result = authenticationService.refreshToken(request);
        return APIResponse.<AuthenticationResponse>builder()
                .result(result)
                .build();
    }
}
