import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'dart:io';
import 'package:image_picker/image_picker.dart';
import '../models/game.dart';
import '../services/api_service.dart';

class AdminGameFormScreen extends StatefulWidget {
  final Game? game;

  const AdminGameFormScreen({super.key, this.game});

  @override
  State<AdminGameFormScreen> createState() => _AdminGameFormScreenState();
}

class _AdminGameFormScreenState extends State<AdminGameFormScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;

  final _idCtrl = TextEditingController();
  final _nameEnCtrl = TextEditingController();
  final _nameIdCtrl = TextEditingController();
  final _catCtrl = TextEditingController();
  
  final _shortDescEnCtrl = TextEditingController();
  final _shortDescIdCtrl = TextEditingController();
  final _descEnCtrl = TextEditingController();
  final _descIdCtrl = TextEditingController();

  final _minPlayerCtrl = TextEditingController();
  final _maxPlayerCtrl = TextEditingController();
  final _playTimeCtrl = TextEditingController();
  final _complexityCtrl = TextEditingController();
  final _designerCtrl = TextEditingController();
  final _yearCtrl = TextEditingController();
  final _mechCtrl = TextEditingController();
  final _imgUrlCtrl = TextEditingController();
  final _vidUrlCtrl = TextEditingController();

  final _htpEnCtrl = TextEditingController();
  final _htpIdCtrl = TextEditingController();

  List<GameRule> _rules = [];
  List<GameFaq> _faqs = [];

  @override
  void initState() {
    super.initState();
    if (widget.game != null) {
      final g = widget.game!;
      _idCtrl.text = g.id;
      _nameEnCtrl.text = g.name.en;
      _nameIdCtrl.text = g.name.id;
      _catCtrl.text = g.category.join(', ');
      
      _shortDescEnCtrl.text = g.shortDescription.en;
      _shortDescIdCtrl.text = g.shortDescription.id;
      _descEnCtrl.text = g.description.en;
      _descIdCtrl.text = g.description.id;

      _minPlayerCtrl.text = g.minPlayers.toString();
      _maxPlayerCtrl.text = g.maxPlayers.toString();
      _playTimeCtrl.text = g.playTime.toString();
      _complexityCtrl.text = g.complexity.toString();
      _designerCtrl.text = g.designer;
      _yearCtrl.text = g.yearPublished.toString();
      _mechCtrl.text = g.mechanics.join(', ');
      _imgUrlCtrl.text = g.imageUrl;
      if (g.videoUrl != null) _vidUrlCtrl.text = g.videoUrl!;

      _htpEnCtrl.text = g.howToPlay.en;
      _htpIdCtrl.text = g.howToPlay.id;

      _rules = List.from(g.rules);
      _faqs = List.from(g.faq);
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    final game = Game(
      id: _idCtrl.text.trim(),
      name: LocalizedString(en: _nameEnCtrl.text.trim(), id: _nameIdCtrl.text.trim()),
      category: _catCtrl.text.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList(),
      shortDescription: LocalizedString(en: _shortDescEnCtrl.text.trim(), id: _shortDescIdCtrl.text.trim()),
      description: LocalizedString(en: _descEnCtrl.text.trim(), id: _descIdCtrl.text.trim()),
      minPlayers: int.tryParse(_minPlayerCtrl.text.trim()) ?? 1,
      maxPlayers: int.tryParse(_maxPlayerCtrl.text.trim()) ?? 4,
      playTime: int.tryParse(_playTimeCtrl.text.trim()) ?? 30,
      complexity: int.tryParse(_complexityCtrl.text.trim()) ?? 1,
      designer: _designerCtrl.text.trim(),
      yearPublished: int.tryParse(_yearCtrl.text.trim()) ?? 2020,
      mechanics: _mechCtrl.text.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList(),
      imageUrl: _imgUrlCtrl.text.trim(),
      videoUrl: _vidUrlCtrl.text.trim(),
      howToPlay: LocalizedString(en: _htpEnCtrl.text.trim(), id: _htpIdCtrl.text.trim()),
      rules: _rules,
      faq: _faqs,
    );

    try {
      if (widget.game == null) {
        await ApiService.createGame(game);
      } else {
        await ApiService.updateGame(game);
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(widget.game == null ? 'Game Created!' : 'Game Updated!')));
        context.pop(true);
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _pickAndUploadImage(TextEditingController ctrl) async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);
    if (pickedFile == null) return;
    
    setState(() => _isLoading = true);
    try {
      final file = File(pickedFile.path);
      final url = await ApiService.uploadImage(file);
      setState(() => ctrl.text = url);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Banner hosted successfully!')));
    } catch(e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Upload failed: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _addRule() {
    final tEnCtrl = TextEditingController();
    final tIdCtrl = TextEditingController();
    final cEnCtrl = TextEditingController();
    final cIdCtrl = TextEditingController();

    showDialog(context: context, builder: (ctx) => AlertDialog(
      title: const Text('Add Rule'),
      content: SingleChildScrollView(child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(controller: tEnCtrl, decoration: const InputDecoration(labelText: 'Title (EN)')),
          TextField(controller: tIdCtrl, decoration: const InputDecoration(labelText: 'Title (ID)')),
          TextField(controller: cEnCtrl, maxLines: 2, decoration: const InputDecoration(labelText: 'Content (EN)')),
          TextField(controller: cIdCtrl, maxLines: 2, decoration: const InputDecoration(labelText: 'Content (ID)')),
        ],
      )),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('CANCEL')),
        TextButton(onPressed: () {
          setState(() {
            _rules.add(GameRule(
              title: LocalizedString(en: tEnCtrl.text, id: tIdCtrl.text),
              content: LocalizedString(en: cEnCtrl.text, id: cIdCtrl.text),
            ));
          });
          Navigator.pop(ctx);
        }, child: const Text('ADD')),
      ],
    ));
  }

  void _addFaq() {
    final qEnCtrl = TextEditingController();
    final qIdCtrl = TextEditingController();
    final aEnCtrl = TextEditingController();
    final aIdCtrl = TextEditingController();

    showDialog(context: context, builder: (ctx) => AlertDialog(
      title: const Text('Add FAQ'),
      content: SingleChildScrollView(child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(controller: qEnCtrl, maxLines: 2, decoration: const InputDecoration(labelText: 'Question (EN)')),
          TextField(controller: qIdCtrl, maxLines: 2, decoration: const InputDecoration(labelText: 'Question (ID)')),
          TextField(controller: aEnCtrl, maxLines: 2, decoration: const InputDecoration(labelText: 'Answer (EN)')),
          TextField(controller: aIdCtrl, maxLines: 2, decoration: const InputDecoration(labelText: 'Answer (ID)')),
        ],
      )),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('CANCEL')),
        TextButton(onPressed: () {
          setState(() {
            _faqs.add(GameFaq(
              q: LocalizedString(en: qEnCtrl.text, id: qIdCtrl.text),
              a: LocalizedString(en: aEnCtrl.text, id: aIdCtrl.text),
            ));
          });
          Navigator.pop(ctx);
        }, child: const Text('ADD')),
      ],
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.game == null ? 'Deploy New Game' : 'Edit Game Parameters'),
        actions: [
          _isLoading 
            ? const Padding(padding: EdgeInsets.all(16.0), child: CircularProgressIndicator())
            : IconButton(icon: const Icon(LucideIcons.save), onPressed: _submit),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16.0),
          children: [
            _buildSectionHead('Core Identifiers'),
            _buildField('Unique Game ID (e.g. wingspan)', _idCtrl, required: true),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(child: _buildField('Image URL', _imgUrlCtrl)),
                const SizedBox(width: 8),
                Container(
                  height: 55,
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ElevatedButton.icon(
                    onPressed: _isLoading ? null : () => _pickAndUploadImage(_imgUrlCtrl),
                    icon: const Icon(LucideIcons.imagePlus),
                    label: const Text('Local'),
                  ),
                )
              ],
            ),
            _buildField('Video URL (YouTube)', _vidUrlCtrl),

            const SizedBox(height: 16),
            _buildSectionHead('Localization: Names'),
            _buildField('Name (EN)', _nameEnCtrl, required: true),
            _buildField('Name (ID)', _nameIdCtrl),
            
            const SizedBox(height: 16),
            _buildSectionHead('Tags & Categories'),
            _buildField('Categories (comma separated)', _catCtrl),
            _buildField('Mechanics (comma separated)', _mechCtrl),

            const SizedBox(height: 16),
            _buildSectionHead('Text Overviews'),
            _buildField('Short Description (EN)', _shortDescEnCtrl, maxLines: 2),
            _buildField('Short Description (ID)', _shortDescIdCtrl, maxLines: 2),
            _buildField('Full Description (EN)', _descEnCtrl, maxLines: 4),
            _buildField('Full Description (ID)', _descIdCtrl, maxLines: 4),

            const SizedBox(height: 16),
            _buildSectionHead('Gameplay Stats'),
            Row(children: [ Expanded(child: _buildField('Min Players', _minPlayerCtrl, type: TextInputType.number)), const SizedBox(width: 8), Expanded(child: _buildField('Max Players', _maxPlayerCtrl, type: TextInputType.number)) ]),
            Row(children: [ Expanded(child: _buildField('Playtime (Min)', _playTimeCtrl, type: TextInputType.number)), const SizedBox(width: 8), Expanded(child: _buildField('Complexity (1-5)', _complexityCtrl, type: TextInputType.number)) ]),
            Row(children: [ Expanded(child: _buildField('Designer', _designerCtrl)), const SizedBox(width: 8), Expanded(child: _buildField('Year Published', _yearCtrl, type: TextInputType.number)) ]),

            const SizedBox(height: 16),
            _buildSectionHead('How To Play (Line-break separated)'),
            _buildField('Instructions (EN)', _htpEnCtrl, maxLines: 5),
            _buildField('Instructions (ID)', _htpIdCtrl, maxLines: 5),

            const SizedBox(height: 16),
            _buildSectionHead('Rules & Mechanisms (${_rules.length})'),
            ..._rules.asMap().entries.map((e) => ListTile(
              title: Text(e.value.title.en),
              subtitle: Text(e.value.content.en, maxLines: 1),
              trailing: IconButton(icon: const Icon(LucideIcons.trash2, color: Colors.red), onPressed: () => setState(() => _rules.removeAt(e.key))),
            )),
            ElevatedButton.icon(onPressed: _addRule, icon: const Icon(LucideIcons.plus), label: const Text('Add Rule Block')),

            const SizedBox(height: 16),
            _buildSectionHead('FAQ Entries (${_faqs.length})'),
            ..._faqs.asMap().entries.map((e) => ListTile(
              title: Text(e.value.q.en),
              subtitle: Text(e.value.a.en, maxLines: 1),
              trailing: IconButton(icon: const Icon(LucideIcons.trash2, color: Colors.red), onPressed: () => setState(() => _faqs.removeAt(e.key))),
            )),
            ElevatedButton.icon(onPressed: _addFaq, icon: const Icon(LucideIcons.plus), label: const Text('Add FAQ Node')),

            const SizedBox(height: 64),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHead(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Text(title, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.primary)),
    );
  }

  Widget _buildField(String label, TextEditingController ctrl, {bool required = false, int maxLines = 1, TextInputType type = TextInputType.text}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: TextFormField(
        controller: ctrl,
        maxLines: maxLines,
        keyboardType: type,
        decoration: InputDecoration(labelText: label, border: const OutlineInputBorder()),
        validator: required ? (v) => (v == null || v.isEmpty) ? 'Required' : null : null,
      ),
    );
  }
}
