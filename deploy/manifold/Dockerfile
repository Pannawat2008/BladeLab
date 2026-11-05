# syntax=docker/dockerfile:1

# ---- build stage: Manifold kernel + the union runner ----
FROM rust:1-slim AS build
# manifold-csg-sys git-clones the Manifold C++ source and compiles it
# (C++17 + cmake), so the builder needs git + ca-certificates too.
RUN apt-get update \
 && apt-get install -y --no-install-recommends build-essential cmake pkg-config git ca-certificates \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /src
COPY Cargo.toml ./
COPY src ./src
RUN cargo build --release

# ---- runtime stage: minimal debian with the static-C++-linked binary ----
# Must match the build base glibc/libstdc++, otherwise the binary needs
# symbols (GLIBC_2.38 / CXXABI_1.3.15) the runtime image lacks.
FROM debian:trixie-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends libgcc-s1 libstdc++6 \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /work
COPY --from=build /src/target/release/manifold-union /usr/local/bin/manifold-union
ENTRYPOINT ["manifold-union"]
