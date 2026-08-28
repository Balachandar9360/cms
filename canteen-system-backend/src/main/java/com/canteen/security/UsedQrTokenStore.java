package com.canteen.security;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Tracks consumed QR token IDs (jti) so a scanned code can't be replayed
 * for a second purchase within its short validity window. In-memory is
 * fine here since QR tokens live for ~90s and this is a single-instance
 * deployment; entries are swept lazily on each check.
 */
@Component
public class UsedQrTokenStore {

    private final Map<String, Long> used = new ConcurrentHashMap<>();

    public synchronized boolean markUsedIfNew(String jti, long expiryEpochMillis) {
        sweep();
        if (used.containsKey(jti)) {
            return false; // already consumed
        }
        used.put(jti, expiryEpochMillis);
        return true;
    }

    private void sweep() {
        long now = System.currentTimeMillis();
        used.entrySet().removeIf(e -> e.getValue() < now);
    }
}