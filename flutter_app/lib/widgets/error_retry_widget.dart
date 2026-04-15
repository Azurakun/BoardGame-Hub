import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

/// A polished, reusable error widget with an icon, descriptive message,
/// optional technical detail, and a retry button.
class ErrorRetryWidget extends StatefulWidget {
  final String message;
  final String? detail;
  final VoidCallback? onRetry;

  const ErrorRetryWidget({
    super.key,
    this.message = 'Something went wrong',
    this.detail,
    this.onRetry,
  });

  /// Factory for FutureBuilder error snapshots.
  factory ErrorRetryWidget.fromSnapshot(
    AsyncSnapshot snapshot, {
    String message = 'Failed to load data',
    VoidCallback? onRetry,
  }) {
    String? detail;
    if (snapshot.hasError) {
      final err = snapshot.error.toString();
      // Strip the "Exception: " prefix for cleaner display
      detail = err.replaceFirst(RegExp(r'^Exception:\s*'), '');
    }
    return ErrorRetryWidget(message: message, detail: detail, onRetry: onRetry);
  }

  @override
  State<ErrorRetryWidget> createState() => _ErrorRetryWidgetState();
}

class _ErrorRetryWidgetState extends State<ErrorRetryWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnim;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _scaleAnim = CurvedAnimation(parent: _controller, curve: Curves.elasticOut);
    _fadeAnim = CurvedAnimation(parent: _controller, curve: Curves.easeIn);
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Center(
      child: FadeTransition(
        opacity: _fadeAnim,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Animated error icon
              ScaleTransition(
                scale: _scaleAnim,
                child: Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: colorScheme.error.withOpacity(0.1),
                    border: Border.all(
                      color: colorScheme.error.withOpacity(0.3),
                      width: 2,
                    ),
                  ),
                  child: Icon(
                    LucideIcons.wifiOff,
                    color: colorScheme.error,
                    size: 36,
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Main message
              Text(
                widget.message,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: colorScheme.onSurface,
                ),
              ),
              const SizedBox(height: 8),

              // Subtle sub-message
              Text(
                'Please check your connection and try again.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13,
                  color: colorScheme.onSurface.withOpacity(0.6),
                ),
              ),

              // Technical detail (if provided)
              if (widget.detail != null && widget.detail!.isNotEmpty) ...[
                const SizedBox(height: 16),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isDark
                        ? Colors.white.withOpacity(0.05)
                        : Colors.black.withOpacity(0.04),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: colorScheme.error.withOpacity(0.15),
                    ),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        LucideIcons.alertTriangle,
                        size: 14,
                        color: colorScheme.error.withOpacity(0.7),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          widget.detail!,
                          style: TextStyle(
                            fontSize: 12,
                            color: colorScheme.onSurface.withOpacity(0.55),
                            fontFamily: 'monospace',
                            height: 1.4,
                          ),
                          maxLines: 3,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              // Retry button
              if (widget.onRetry != null) ...[
                const SizedBox(height: 24),
                SizedBox(
                  width: 180,
                  height: 48,
                  child: ElevatedButton.icon(
                    onPressed: widget.onRetry,
                    icon: const Icon(LucideIcons.refreshCw, size: 18),
                    label: const Text(
                      'Retry',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: colorScheme.primary,
                      foregroundColor: colorScheme.onPrimary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      elevation: 2,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
